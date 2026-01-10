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

/**
 * Find ROM in local folders
 */
function findRomPath(fileName: string): string | null {
    // Decode URI-encoded filename
    const decodedFileName = decodeURIComponent(fileName);

    for (const folder of ROM_FOLDERS) {
        const fullPath = path.join(LIBRARY_PATH, folder, decodedFileName);
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
                'Access-Control-Allow-Origin': '*',
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
