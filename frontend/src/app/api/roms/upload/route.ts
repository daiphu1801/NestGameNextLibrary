import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// ─── Constants ────────────────────────────────────────────────────────────────
const LIBRARY_PATH = path.join(process.cwd(), 'LibraryNes');
const DEFAULT_FOLDER = 'Nes ROMs Complete 1 Of 4';
const ALLOWED_EXTENSIONS = ['.nes', '.zip'];
const ALLOWED_FOLDERS = [
    'Nes ROMs Complete 1 Of 4',
    'Nes ROMs Complete 2 Of 4',
    'Nes ROMs Complete 3 Of 4',
    'Nes ROMs Complete 4 Of 4',
];

// ─── R2 Client ────────────────────────────────────────────────────────────────
function getR2Client(): S3Client | null {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) return null;

    return new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
    });
}

function getR2BucketName(): string {
    return process.env.R2_BUCKET_NAME || 'nesgame';
}

/**
 * Build public R2 URL from object key.
 * Uses NEXT_PUBLIC_R2_URL as base (e.g. https://pub-xxx.r2.dev/)
 */
function buildR2PublicUrl(key: string): string {
    const base = process.env.NEXT_PUBLIC_R2_URL || '';
    const trimmedBase = base.endsWith('/') ? base : `${base}/`;
    return `${trimmedBase}${key}`;
}

// ─── Environment detection ────────────────────────────────────────────────────
function isProduction(): boolean {
    const hasR2 =
        !!process.env.R2_ACCOUNT_ID &&
        !!process.env.R2_ACCESS_KEY_ID &&
        !!process.env.R2_SECRET_ACCESS_KEY;
    const hasLocalLibrary = fs.existsSync(LIBRARY_PATH);
    // Production: R2 credentials present AND no local LibraryNes folder
    return hasR2 && !hasLocalLibrary;
}

// ─── R2 Upload ────────────────────────────────────────────────────────────────
async function uploadToR2(
    buffer: Buffer,
    fileName: string,
    contentType: string
): Promise<{ url: string; key: string }> {
    const client = getR2Client();
    if (!client) throw new Error('R2 credentials not configured');

    const bucket = getR2BucketName();
    // Store under roms/ prefix so it's organized
    const key = `roms/${fileName}`;

    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // Public-read via R2 public bucket settings
        CacheControl: 'public, max-age=31536000, immutable',
    }));

    return {
        url: buildR2PublicUrl(key),
        key,
    };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
}

function getContentType(ext: string): string {
    if (ext === '.zip') return 'application/zip';
    if (ext === '.nes') return 'application/x-nes-rom';
    return 'application/octet-stream';
}

function saveLocally(buffer: Buffer, folder: string, safeFileName: string): string {
    const targetDir = path.join(LIBRARY_PATH, folder);
    const targetPath = path.join(targetDir, safeFileName);

    // Security: prevent path traversal
    const resolvedTarget = path.resolve(targetPath);
    const resolvedLibrary = path.resolve(LIBRARY_PATH);
    if (!resolvedTarget.startsWith(resolvedLibrary + path.sep)) {
        throw new Error('Path traversal detected');
    }

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(targetPath)) {
        throw Object.assign(new Error(`File "${safeFileName}" already exists.`), { status: 409 });
    }

    fs.writeFileSync(targetPath, buffer);
    return `${folder}/${safeFileName}`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const folder = (formData.get('folder') as string) || DEFAULT_FOLDER;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate extension
        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                { error: `"${ext}" không được hỗ trợ. Chỉ dùng .nes hoặc .zip.` },
                { status: 400 }
            );
        }

        const safeFileName = sanitizeFileName(file.name);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = getContentType(ext);

        // ── Production: upload to Cloudflare R2 ───────────────────────────────
        if (isProduction()) {
            const { url, key } = await uploadToR2(buffer, safeFileName, contentType);
            console.log(`[R2] Uploaded: ${key} → ${url}`);

            return NextResponse.json({
                success: true,
                mode: 'r2',
                fileName: safeFileName,
                // path = full public R2 URL → emulatorService loads directly
                path: url,
                sizeBytes: buffer.length,
            });
        }

        // ── Local: save to LibraryNes ─────────────────────────────────────────
        if (!ALLOWED_FOLDERS.includes(folder)) {
            return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
        }

        try {
            const relPath = saveLocally(buffer, folder, safeFileName);
            return NextResponse.json({
                success: true,
                mode: 'local',
                fileName: safeFileName,
                path: relPath,
                folder,
                sizeBytes: buffer.length,
            });
        } catch (err: any) {
            const status = err.status || 500;
            return NextResponse.json({ error: err.message }, { status });
        }
    } catch (error: any) {
        console.error('ROM upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload thất bại' }, { status: 500 });
    }
}
