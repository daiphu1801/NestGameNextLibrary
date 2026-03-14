import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const LIBRARY_PATH = path.join(process.cwd(), 'LibraryNes');
const ALLOWED_EXTENSIONS = ['.nes', '.zip', '.sfc', '.smc', '.gba', '.md', '.gen', '.bin'];

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

function buildR2PublicUrl(key: string): string {
    const base = process.env.NEXT_PUBLIC_R2_URL || '';
    const trimmedBase = base.endsWith('/') ? base : `${base}/`;
    return `${trimmedBase}${key}`;
}

function isProduction(): boolean {
    const hasR2 = !!process.env.R2_ACCOUNT_ID && !!process.env.R2_ACCESS_KEY_ID && !!process.env.R2_SECRET_ACCESS_KEY;
    const hasLocalLibrary = fs.existsSync(LIBRARY_PATH);
    return hasR2 && !hasLocalLibrary;
}

function sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
}

function getContentType(ext: string): string {
    if (ext === '.zip') return 'application/zip';
    if (ext === '.nes') return 'application/x-nes-rom';
    if (ext === '.sfc' || ext === '.smc') return 'application/x-snes-rom';
    if (ext === '.gba') return 'application/x-gba-rom';
    if (ext === '.md' || ext === '.gen' || ext === '.bin') return 'application/x-genesis-rom';
    return 'application/octet-stream';
}

export async function POST(request: NextRequest) {
    try {
        const { fileName } = await request.json();
        
        if (!fileName) {
            return NextResponse.json({ error: 'No file name provided' }, { status: 400 });
        }

        const ext = path.extname(fileName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json({ error: `"${ext}" không được hỗ trợ. Chỉ dùng .nes, .sfc, .gba, .md, .zip.` }, { status: 400 });
        }

        if (!isProduction()) {
            // Fallback to local
            return NextResponse.json({ mode: 'local' });
        }

        const safeFileName = sanitizeFileName(fileName);
        const contentType = getContentType(ext);
        const client = getR2Client();
        
        if (!client) {
            return NextResponse.json({ error: 'R2 credentials not configured' }, { status: 500 });
        }

        const bucket = getR2BucketName();
        const key = `roms/${safeFileName}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
        });

        // Generate Presigned URL
        const presignedUrl = await getSignedUrl(client, command, { expiresIn: 300 });

        return NextResponse.json({
            mode: 'r2',
            presignedUrl,
            publicUrl: buildR2PublicUrl(key),
            fileName: safeFileName,
            key,
            contentType
        });

    } catch (error: any) {
        console.error('Presign generation error:', error);
        return NextResponse.json({ error: error.message || 'Lỗi tạo presigned URL' }, { status: 500 });
    }
}
