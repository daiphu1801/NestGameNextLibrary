import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for Cloudinary ROM files.
 * Emulator fetches: /api/roms/proxy?url=https://res.cloudinary.com/...
 * Server fetches Cloudinary (no CORS), streams back to browser.
 * This avoids 401/CORS issues when Cloudinary has access restrictions.
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    // Only allow Cloudinary URLs
    if (!url.startsWith('https://res.cloudinary.com/')) {
        return NextResponse.json({ error: 'Only Cloudinary URLs are allowed' }, { status: 403 });
    }

    try {
        const upstream = await fetch(url, {
            headers: {
                // Pass Accept to help Cloudinary serve the right content
                'Accept': '*/*',
            },
            // Add Cloudinary credentials if needed (Basic Auth)
            // Cloudinary raw/upload type should be public, but just in case:
        });

        if (!upstream.ok) {
            return NextResponse.json(
                { error: `Upstream returned ${upstream.status}` },
                { status: upstream.status }
            );
        }

        const buffer = await upstream.arrayBuffer();
        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        const contentLength = upstream.headers.get('content-length') || String(buffer.byteLength);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': contentLength,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (error: any) {
        console.error('ROM proxy error:', error);
        return NextResponse.json({ error: 'Proxy fetch failed' }, { status: 500 });
    }
}

export async function HEAD(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    if (!url || !url.startsWith('https://res.cloudinary.com/')) {
        return new NextResponse(null, { status: 400 });
    }

    try {
        const upstream = await fetch(url, { method: 'HEAD' });
        return new NextResponse(null, {
            status: upstream.ok ? 200 : 404,
            headers: upstream.ok ? {
                'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
                'Content-Length': upstream.headers.get('content-length') || '0',
            } : {},
        });
    } catch {
        return new NextResponse(null, { status: 404 });
    }
}
