import { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const ADMIN_API = `${API_BASE}/admin`;

// ─── Image source helpers ─────────────────────────────────────────────────────

const FETCH_OPTIONS = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NestGameBot/1.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
};

/** Strip ROM extension + region tags from filename to get clean game name */
function cleanGameName(raw: string): string {
    return raw
        .replace(/\.(zip|nes|smc|sfc|gb|gbc|gba|n64|z64|v64|nds|iso|bin|cue)$/i, '')
        .replace(/\s*\([^)]*\)\s*/g, ' ')  // remove (USA), (Japan), (Rev 1) etc.
        .replace(/\s*\[[^\]]*\]\s*/g, ' ') // remove [!], [b1] etc.
        .replace(/[_]+/g, ' ')
        .trim();
}

/** Encode for Libretro URL (spaces → %20, special chars preserved) */
function libretroEncode(name: string): string {
    return encodeURIComponent(name).replace(/%20/g, '%20');
}

/** Build Libretro thumbnail URLs for a game name */
function buildLibretroUrls(name: string): string[] {
    const clean = cleanGameName(name);
    const encoded = libretroEncode(clean);
    const base = 'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System';
    return [
        `${base}/Named_Boxarts/${encoded}.png`,
        `${base}/Named_Snaps/${encoded}.png`,
        `${base}/Named_Titles/${encoded}.png`,
    ];
}

/** Check if a URL is alive (HEAD request, 3s timeout) */
async function isUrlAlive(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, {
            method: 'HEAD',
            ...FETCH_OPTIONS,
            signal: AbortSignal.timeout(3000),
        });
        return res.ok;
    } catch {
        return false;
    }
}

/** Fallback 1: Libretro Thumbnails — try all 3 types */
async function findLibretroImage(gameName: string): Promise<string | null> {
    const urls = buildLibretroUrls(gameName);
    for (const url of urls) {
        if (await isUrlAlive(url)) return url;
    }
    return null;
}

/** Fallback 2: Wikipedia pageimages API */
async function findWikipediaImage(gameName: string): Promise<string | null> {
    try {
        const clean = cleanGameName(gameName);
        const query = encodeURIComponent(`${clean} NES game`);
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
        const res = await fetch(apiUrl, { ...FETCH_OPTIONS, signal: AbortSignal.timeout(5000) });
        if (!res.ok) return null;
        const data = await res.json();
        const pages = data?.query?.pages || {};
        const page = Object.values(pages)[0] as any;
        return page?.thumbnail?.source || null;
    } catch {
        return null;
    }
}

/** Fallback 3: Google Custom Search API */
async function findGoogleImage(gameName: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    if (!apiKey || !cseId) return null;

    try {
        const clean = cleanGameName(gameName);
        const q = encodeURIComponent(`${clean} NES game cover art box`);
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&searchType=image&q=${q}&num=3&imgType=photo&imgSize=medium`;
        const res = await fetch(url, { ...FETCH_OPTIONS, signal: AbortSignal.timeout(8000) });
        if (!res.ok) return null;
        const data = await res.json();
        const items = data?.items || [];
        // Return first alive result
        for (const item of items) {
            const imgUrl = item?.link;
            if (imgUrl && await isUrlAlive(imgUrl)) return imgUrl;
        }
        return null;
    } catch {
        return null;
    }
}

/** Update game image via Spring Boot admin API */
async function updateGameImage(
    gameId: number,
    imageUrl: string,
    authHeader: string,
    currentGame: any
): Promise<boolean> {
    try {
        const res = await fetch(`${ADMIN_API}/games/${gameId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                name: currentGame.name,
                fileName: currentGame.fileName,
                path: currentGame.path,
                categoryId: currentGame.categoryId || 1,
                description: currentGame.description || '',
                rating: currentGame.rating || 0,
                year: currentGame.year || new Date().getFullYear(),
                region: currentGame.region || 'US',
                isFeatured: currentGame.isFeatured || false,
                imageUrl,
                imageSnap: currentGame.imageSnap || '',
                imageTitle: currentGame.imageTitle || ''
            }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ─── Fetch all games from backend ─────────────────────────────────────────────
async function fetchAllGames(authHeader: string): Promise<any[]> {
    const allGames: any[] = [];
    let page = 0;
    const size = 100;

    while (true) {
        const res = await fetch(`${ADMIN_API}/games?page=${page}&size=${size}`, {
            headers: { 'Authorization': authHeader },
        });
        if (!res.ok) break;
        const data = await res.json();
        const content = data?.content || [];
        allGames.push(...content);
        if (page >= (data?.totalPages || 1) - 1) break;
        page++;
    }

    return allGames;
}

// ─── SSE Route Handler ────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
    const mode = request.nextUrl.searchParams.get('mode') || 'fix'; // 'fix' | 'preview'
    const authHeader = request.headers.get('Authorization') || '';

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: object) => {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                } catch { /* stream closed */ }
            };

            try {
                send({ type: 'start', message: 'Đang tải danh sách game...' });

                const games = await fetchAllGames(authHeader);
                send({ type: 'total', total: games.length });

                let fixed = 0, notFound = 0, ok = 0;

                for (let i = 0; i < games.length; i++) {
                    const game = games[i];
                    const { id, name, fileName, imageUrl: currentImageUrl } = game;

                    send({ type: 'progress', current: i + 1, total: games.length, name });

                    // Check current image
                    const hasImage = currentImageUrl && currentImageUrl.startsWith('http');
                    const isAlive = hasImage ? await isUrlAlive(currentImageUrl) : false;

                    if (isAlive) {
                        ok++;
                        send({ type: 'result', id, name, status: 'ok' });
                        continue;
                    }

                    // Try to find a new image
                    const searchName = name || fileName || '';
                    let newUrl: string | null = null;
                    let source = '';

                    newUrl = await findLibretroImage(searchName);
                    if (newUrl) source = 'Libretro';

                    if (!newUrl) {
                        newUrl = await findWikipediaImage(searchName);
                        if (newUrl) source = 'Wikipedia';
                    }

                    if (!newUrl) {
                        newUrl = await findGoogleImage(searchName);
                        if (newUrl) source = 'Google';
                    }

                    if (newUrl) {
                        fixed++;
                        if (mode === 'fix') {
                            await updateGameImage(id, newUrl, authHeader, game);
                        }
                        send({ type: 'result', id, name, status: 'fixed', newUrl, source });
                    } else {
                        notFound++;
                        send({ type: 'result', id, name, status: 'not_found' });
                    }

                    // Small delay to avoid rate limiting
                    await new Promise(r => setTimeout(r, 100));
                }

                send({ type: 'done', stats: { total: games.length, fixed, notFound, ok } });
            } catch (err: any) {
                send({ type: 'error', message: err.message || 'Đã xảy ra lỗi' });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-store',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
