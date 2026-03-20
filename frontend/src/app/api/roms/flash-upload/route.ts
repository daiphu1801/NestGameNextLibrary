import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ─── Constants ────────────────────────────────────────────────────────────────
const LIBRARY_PATH = path.join(process.cwd(), 'LibraryNes');

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

function sanitizePath(p: string): string {
    return p.replace(/\\/g, '/').replace(/[\x00-\x1F]/g, '').replace(/\.\.\//g, '');
}

function getContentType(ext: string): string {
    const map: Record<string, string> = {
        '.swf': 'application/x-shockwave-flash',
        '.xml': 'application/xml',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.txt': 'text/plain',
        '.dat': 'application/octet-stream',
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const gameName = (formData.get('gameName') as string) || '';
        const entryFile = (formData.get('entryFile') as string) || '';

        if (!gameName) {
            return NextResponse.json({ error: 'Thiếu tên game' }, { status: 400 });
        }

        // Sanitize game name for use as folder name
        const safeGameName = gameName
            .toLowerCase()
            .replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF\s-]/gi, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

        // Collect all files from the form
        const files: { file: File; relativePath: string }[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file_') && value instanceof File) {
                const pathKey = key.replace('file_', 'path_');
                const relativePath = (formData.get(pathKey) as string) || value.name;
                files.push({ file: value, relativePath: sanitizePath(relativePath) });
            }
        }

        if (files.length === 0) {
            return NextResponse.json({ error: 'Không có file nào được upload' }, { status: 400 });
        }

        const results: { path: string; size: number; status: 'ok' | 'error'; error?: string }[] = [];
        let mainSwfUrl = '';

        if (isProduction()) {
            // ── Production: Upload to R2 ──────────────────────────────────────
            const client = getR2Client();
            if (!client) {
                return NextResponse.json({ error: 'R2 credentials not configured' }, { status: 500 });
            }
            const bucket = getR2BucketName();

            for (const { file, relativePath } of files) {
                try {
                    const key = `roms/flash/${safeGameName}/${relativePath}`;
                    const ext = path.extname(relativePath).toLowerCase();
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    await client.send(new PutObjectCommand({
                        Bucket: bucket,
                        Key: key,
                        Body: buffer,
                        ContentType: getContentType(ext),
                        CacheControl: 'public, max-age=31536000, immutable',
                    }));

                    const url = buildR2PublicUrl(key);
                    results.push({ path: relativePath, size: buffer.length, status: 'ok' });

                    // Track the main entry SWF URL
                    if (relativePath === entryFile || (ext === '.swf' && !mainSwfUrl)) {
                        mainSwfUrl = url;
                    }
                } catch (err: any) {
                    results.push({ path: relativePath, size: 0, status: 'error', error: err.message });
                }
            }
        } else {
            // ── Local: Save to LibraryNes/flash/ ─────────────────────────────
            const baseDir = path.join(LIBRARY_PATH, 'flash', safeGameName);

            for (const { file, relativePath } of files) {
                try {
                    const targetPath = path.join(baseDir, relativePath);
                    const resolvedTarget = path.resolve(targetPath);
                    if (!resolvedTarget.startsWith(path.resolve(baseDir) + path.sep) && resolvedTarget !== path.resolve(baseDir)) {
                        results.push({ path: relativePath, size: 0, status: 'error', error: 'Path traversal detected' });
                        continue;
                    }

                    const targetDir = path.dirname(targetPath);
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }

                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    fs.writeFileSync(targetPath, buffer);

                    results.push({ path: relativePath, size: buffer.length, status: 'ok' });

                    const ext = path.extname(relativePath).toLowerCase();
                    if (relativePath === entryFile || (ext === '.swf' && !mainSwfUrl)) {
                        mainSwfUrl = `flash/${safeGameName}/${relativePath}`;
                    }
                } catch (err: any) {
                    results.push({ path: relativePath, size: 0, status: 'error', error: err.message });
                }
            }
        }

        const successCount = results.filter(r => r.status === 'ok').length;
        const errorCount = results.filter(r => r.status === 'error').length;

        return NextResponse.json({
            success: errorCount === 0,
            mode: isProduction() ? 'r2' : 'local',
            gameName: safeGameName,
            mainSwfUrl,
            totalFiles: files.length,
            successCount,
            errorCount,
            results,
        });

    } catch (error: any) {
        console.error('Flash upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload thất bại' }, { status: 500 });
    }
}
