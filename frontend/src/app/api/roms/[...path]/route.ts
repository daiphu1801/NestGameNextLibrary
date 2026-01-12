import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ROM_FOLDERS = [
    'Nes ROMs Complete 1 Of 4',
    'Nes ROMs Complete 2 Of 4',
    'Nes ROMs Complete 3 Of 4',
    'Nes ROMs Complete 4 Of 4',
];

const LIBRARY_PATH = path.join(process.cwd(), 'LibraryNes');

// Allowed file extensions for ROM files (security)
const ALLOWED_EXTENSIONS = ['.nes', '.zip'];

/**
 * Validate filename to prevent path traversal attacks
 * @security Defense-in-depth protection
 */
function isValidFileName(fileName: string): boolean {
    const decoded = decodeURIComponent(fileName);

    // Block path traversal patterns
    if (decoded.includes('..') || decoded.includes('~')) {
        console.warn('[Security] Path traversal attempt blocked:', fileName);
        return false;
    }

    // Block absolute paths and special characters
    if (/^[\/\\]|[:\\*\\?"<>|]/.test(decoded)) {
        console.warn('[Security] Invalid characters in filename:', fileName);
        return false;
    }

    // Only allow specific ROM extensions
    const ext = path.extname(decoded).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        console.warn('[Security] Invalid file extension:', ext);
        return false;
    }

    return true;
}

/**
 * Find ROM in local folders with security checks
 */
function findRomPath(fileName: string): string | null {
    // Validate input first (defense-in-depth)
    if (!isValidFileName(fileName)) {
        return null;
    }

    // Decode URI-encoded filename
    const decodedFileName = decodeURIComponent(fileName);

    for (const folder of ROM_FOLDERS) {
        const fullPath = path.join(LIBRARY_PATH, folder, decodedFileName);

        // Security: Ensure resolved path stays within library directory
        const resolvedPath = path.resolve(fullPath);
        const libraryResolved = path.resolve(LIBRARY_PATH);

        if (!resolvedPath.startsWith(libraryResolved + path.sep)) {
            console.warn('[Security] Path escape attempt blocked:', resolvedPath);
            return null;
        }

        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }
    return null;
}

/**
 * API Route to serve local ROM files
 * GET /api/roms/[filename]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;
        const fileName = pathSegments.join('/');

        const romPath = findRomPath(fileName);

        if (!romPath) {
            return NextResponse.json(
                { error: 'ROM not found locally', fileName },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = fs.readFileSync(romPath);

        // Determine content type based on extension
        const ext = path.extname(romPath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.zip') {
            contentType = 'application/zip';
        } else if (ext === '.nes') {
            contentType = 'application/x-nes-rom';
        }

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
                // CORS: Use site URL or allow all for ROM files
                'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
                // Security: Prevent MIME sniffing
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (error) {
        console.error('Error serving ROM:', error);
        return NextResponse.json(
            { error: 'Failed to serve ROM file' },
            { status: 500 }
        );
    }
}
