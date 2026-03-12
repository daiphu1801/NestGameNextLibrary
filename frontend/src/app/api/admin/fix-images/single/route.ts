import { NextRequest, NextResponse } from 'next/server';
import { findLibretroImages, findWikipediaImage, findGoogleImage } from '../helpers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── GET /api/admin/fix-images/single?gameId=123 ─────────────────────────────
export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get('gameId');
    if (!gameId) return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });

    const authHeader = request.headers.get('Authorization') || '';

    // Fetch game info from backend (public endpoint)
    let gameName = '';
    try {
        const res = await fetch(`${API_BASE}/games/${gameId}`, {
            headers: authHeader ? { Authorization: authHeader } : {},
        });
        if (res.ok) {
            const game = await res.json();
            gameName = game?.name || game?.fileName || '';
        }
    } catch { /* try anyway */ }

    if (!gameName) {
        return NextResponse.json({ url: null, snap: null, title: null, source: null });
    }

    // Libretro finds all 3 image types at once
    const libretro = await findLibretroImages(gameName);

    // Fallback chain for boxart only
    let url: string | null = libretro.boxart;
    let source: string | null = libretro.boxart ? 'Libretro' : null;

    if (!url) {
        url = await findWikipediaImage(gameName);
        if (url) source = 'Wikipedia';
    }
    if (!url) {
        url = await findGoogleImage(gameName);
        if (url) source = 'Google';
    }

    return NextResponse.json({
        url,
        snap: libretro.snap,
        title: libretro.title,
        source,
    });
}
