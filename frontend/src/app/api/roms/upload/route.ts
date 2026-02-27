import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ─── Local config ──────────────────────────────────────────────────────────────
const LIBRARY_PATH = path.join(process.cwd(), 'LibraryNes');
const DEFAULT_FOLDER = 'Nes ROMs Complete 1 Of 4';
const ALLOWED_EXTENSIONS = ['.nes', '.zip'];
const ALLOWED_FOLDERS = [
    'Nes ROMs Complete 1 Of 4',
    'Nes ROMs Complete 2 Of 4',
    'Nes ROMs Complete 3 Of 4',
    'Nes ROMs Complete 4 Of 4',
];

// ─── Environment detection ────────────────────────────────────────────────────
/**
 * Production = Cloudinary credentials are set AND no local LibraryNes folder
 * Local = LibraryNes folder exists OR no Cloudinary credentials
 */
function isProduction(): boolean {
    const hasCloudinary =
        !!process.env.CLOUDINARY_CLOUD_NAME &&
        !!process.env.CLOUDINARY_API_KEY &&
        !!process.env.CLOUDINARY_API_SECRET;
    const hasLocalLibrary = fs.existsSync(LIBRARY_PATH);
    return hasCloudinary && !hasLocalLibrary;
}

// ─── Cloudinary upload ────────────────────────────────────────────────────────
async function uploadToCloudinary(
    file: File,
    fileName: string
): Promise<{ secureUrl: string; publicId: string }> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

    // Cloudinary signed upload: need timestamp + signature
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'nes-roms';

    // Build signature string: folder=...&public_id=...&timestamp=...{secret}
    const paramsToSign = `folder=${folder}&public_id=${encodePublicId(fileName)}&timestamp=${timestamp}`;
    const signature = await sha1(paramsToSign + apiSecret);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('public_id', encodePublicId(fileName));
    // Upload as 'raw' resource type to keep original binary file intact
    formData.append('resource_type', 'raw');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return {
        secureUrl: data.secure_url,
        publicId: data.public_id,
    };
}

/** Convert filename to a Cloudinary-safe public_id (no extension, no special chars) */
function encodePublicId(fileName: string): string {
    // Keep the extension separately — Cloudinary raw preserves it if set in public_id
    return fileName.replace(/[^a-zA-Z0-9_\-\.\(\)\[\]!]/g, '_');
}

/** SHA-1 hash using Web Crypto API (Node.js 18+ compatible) */
async function sha1(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Local save ───────────────────────────────────────────────────────────────
function sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
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

        // ── Production: upload to Cloudinary ──────────────────────────────────
        if (isProduction()) {
            const { secureUrl } = await uploadToCloudinary(file, safeFileName);

            return NextResponse.json({
                success: true,
                mode: 'cloudinary',
                fileName: safeFileName,
                // path = full Cloudinary URL → emulatorService uses it directly
                path: secureUrl,
                sizeBytes: file.size,
            });
        }

        // ── Local: save to LibraryNes ─────────────────────────────────────────
        if (!ALLOWED_FOLDERS.includes(folder)) {
            return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

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
