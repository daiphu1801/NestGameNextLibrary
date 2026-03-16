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
const ALLOWED_EXTENSIONS = ['.nes', '.zip', '.sfc', '.smc', '.gba', '.md', '.gen', '.bin', '.cue', '.iso', '.chd', '.pbp', '.cso'];

/**
 * Find ROM file with security checks.
 * Handles two path formats:
 *   1. "Nes ROMs Complete 1 Of 4/Game.zip"  — includes folder prefix
 *   2. "Game.zip"                             — bare filename, scan all folders
 */
function findRomPath(rawPath: string): string | null {
    const decoded = rawPath.includes('%') ? decodeURIComponent(rawPath) : rawPath;

    // Block path traversal
    if (decoded.includes('..') || decoded.includes('~')) {
        console.warn('[Security] Path traversal attempt blocked:', decoded);
        return null;
    }

    const ext = path.extname(decoded).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        console.warn('[Security] Invalid file extension:', ext);
        return null;
    }

    const libraryResolved = path.resolve(LIBRARY_PATH);

    const attemptPath = (candidate: string): string | null => {
        const resolved = path.resolve(candidate);
        if (!resolved.startsWith(libraryResolved + path.sep)) {
            console.warn('[Security] Path escape blocked:', resolved);
            return null;
        }
        return fs.existsSync(candidate) ? candidate : null;
    };

    // Case 1: path already includes a known folder prefix
    for (const folder of ROM_FOLDERS) {
        if (decoded.startsWith(folder + '/') || decoded.startsWith(folder + path.sep)) {
            return attemptPath(path.join(LIBRARY_PATH, decoded));
        }
    }

    // Case 2: bare filename — scan all folders
    for (const folder of ROM_FOLDERS) {
        const found = attemptPath(path.join(LIBRARY_PATH, folder, decoded));
        if (found) return found;
    }

    return null;
}

/** Shared logic for GET and HEAD requests */
async function handleRomRequest(
    params: Promise<{ path: string[] }>,
    includeBody: boolean
) {
    try {
        const { path: pathSegments } = await params;
        const joined = pathSegments.join('/');

        const romPath = findRomPath(joined);
        if (!romPath) {
            return NextResponse.json({ error: 'ROM not found locally', fileName: joined }, { status: 404 });
        }

        const ext = path.extname(romPath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.zip') contentType = 'application/zip';
        else if (ext === '.nes') contentType = 'application/x-nes-rom';
        else if (ext === '.sfc' || ext === '.smc') contentType = 'application/x-snes-rom';
        else if (ext === '.gba') contentType = 'application/x-gba-rom';
        else if (ext === '.md' || ext === '.gen') contentType = 'application/x-genesis-rom';
        else if (ext === '.bin' || ext === '.iso' || ext === '.chd' || ext === '.cue' || ext === '.pbp' || ext === '.cso') {
            contentType = 'application/octet-stream';
        }

        const stat = fs.statSync(romPath);
        const headers: Record<string, string> = {
            'Content-Type': contentType,
            'Content-Length': stat.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
            'X-Content-Type-Options': 'nosniff',
        };

        if (!includeBody) {
            // HEAD: headers only, no body
            return new NextResponse(null, { status: 200, headers });
        }

        // Use readable stream for better performance with large files (PS1/PSP)
        const fileStream = fs.createReadStream(romPath);
        // @ts-ignore - NextResponse accepts ReadableStream
        return new NextResponse(fileStream, { status: 200, headers });
    } catch (error) {
        console.error('Error serving ROM:', error);
        return NextResponse.json({ error: 'Failed to serve ROM file' }, { status: 500 });
    }
}

export function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleRomRequest(params, true);
}

/** HEAD is called by emulatorService to check if ROM exists locally */
export function HEAD(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleRomRequest(params, false);
}
