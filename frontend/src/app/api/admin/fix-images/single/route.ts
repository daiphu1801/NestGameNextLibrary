import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const ADMIN_API = `${API_BASE}/admin`;

// ─── Helpers (duplicated from parent route for isolation) ─────────────────────
function cleanGameName(raw: string): string {
    return raw
        .replace(/\.(zip|nes|smc|sfc|gb|gbc|gba|n64|z64|v64|nds|iso|bin|cue)$/i, '')
        .replace(/\s*\([^)]*\)\s*/g, ' ')
        .replace(/\s*\[[^\]]*\]\s*/g, ' ')
        .trim();
}

async function isUrlAlive(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
        return res.ok;
    } catch { return false; }
}

async function findLibretro(name: string): Promise<string | null> {
    const clean = cleanGameName(name);
    const encoded = encodeURIComponent(clean);
    const base = 'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System';
    for (const type of ['Named_Boxarts', 'Named_Snaps', 'Named_Titles']) {
        const url = `${base}/${type}/${encoded}.png`;
        if (await isUrlAlive(url)) return url;
    }
    return null;
}

async function findWikipedia(name: string): Promise<string | null> {
    try {
        const clean = cleanGameName(name);
        const q = encodeURIComponent(`${clean} NES game`);
        const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${q}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
        const res = await fetch(api, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return null;
        const data = await res.json();
        const page = Object.values(data?.query?.pages || {})[0] as any;
        return page?.thumbnail?.source || null;
    } catch { return null; }
}

async function findGoogle(name: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    if (!apiKey || !cseId) return null;
    try {
        const clean = cleanGameName(name);
        const q = encodeURIComponent(`${clean} NES game cover art`);
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&searchType=image&q=${q}&num=3`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return null;
        const data = await res.json();
        for (const item of (data?.items || [])) {
            if (item?.link && await isUrlAlive(item.link)) return item.link;
        }
        return null;
    } catch { return null; }
}

// ─── GET /api/admin/fix-images/single?gameId=123 ─────────────────────────────
export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get('gameId');
    if (!gameId) return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });

    const authHeader = request.headers.get('Authorization') || '';

    // Fetch game info from backend
    let gameName = '';
    try {
        const res = await fetch(`${ADMIN_API}/games?page=0&size=1000`, {
            headers: { 'Authorization': authHeader },
        });
        if (res.ok) {
            const data = await res.json();
            const game = (data?.content || []).find((g: any) => String(g.id) === gameId);
            gameName = game?.name || game?.fileName || '';
        }
    } catch { /* try anyway */ }

    if (!gameName) {
        return NextResponse.json({ url: null, source: null });
    }

    // Try all 3 sources
    let url: string | null = null;
    let source: string | null = null;

    url = await findLibretro(gameName);
    if (url) { source = 'Libretro'; }

    if (!url) {
        url = await findWikipedia(gameName);
        if (url) source = 'Wikipedia';
    }

    if (!url) {
        url = await findGoogle(gameName);
        if (url) source = 'Google';
    }

    return NextResponse.json({ url, source });
}
