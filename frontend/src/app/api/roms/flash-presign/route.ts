import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const LIBRARY_PATH = path.join(process.cwd(), 'LibraryNes');

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { gameName, files } = body;

        if (!gameName) {
            return NextResponse.json({ error: 'Thiếu tên game' }, { status: 400 });
        }
        if (!files || !Array.isArray(files) || files.length === 0) {
            return NextResponse.json({ error: 'Thiếu danh sách file' }, { status: 400 });
        }

        if (!isProduction()) {
            return NextResponse.json({ mode: 'local' });
        }

        const client = getR2Client();
        if (!client) {
            return NextResponse.json({ error: 'R2 credentials not configured' }, { status: 500 });
        }

        const safeGameName = gameName
            .toLowerCase()
            .replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF\s-]/gi, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

        const bucket = getR2BucketName();
        const results = [];

        for (const file of files) {
            const relativePath = sanitizePath(file.path);
            const key = `roms/flash/${safeGameName}/${relativePath}`;
            const ext = path.extname(relativePath).toLowerCase();
            const contentType = getContentType(ext);

            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                ContentType: contentType,
                CacheControl: 'public, max-age=31536000, immutable',
            });

            const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour

            results.push({
                path: relativePath,
                presignedUrl,
                publicUrl: buildR2PublicUrl(key),
                contentType,
                key
            });
        }

        return NextResponse.json({
            mode: 'r2',
            gameName: safeGameName,
            files: results
        });

    } catch (error: any) {
        console.error('Flash presign config error:', error);
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
    }
}
