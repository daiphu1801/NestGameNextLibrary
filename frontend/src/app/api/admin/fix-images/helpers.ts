/**
 * Shared helpers for admin image fix routes.
 * Used by both /api/admin/fix-images (bulk SSE) and /api/admin/fix-images/single.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const ADMIN_API = `${API_BASE}/admin`;

const NES_LIBRETRO_BASE =
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System';

const FETCH_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NestGameBot/1.0',
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
};

// ─── Name normalization ────────────────────────────────────────────────────────

/**
 * Given a raw ROM filename / game name, return an array of candidate strings
 * to try against Libretro, ordered by specificity (region-tagged first).
 *
 * Strategy: keep the original region tag as the first candidate so Libretro
 * can match e.g. "Super Mario Bros. (USA)" before falling back to bare name.
 */
export function getLibretroCandidates(raw: string): string[] {
    // 1. Strip ROM file extension
    const noExt = raw.replace(
        /\.(zip|nes|smc|sfc|gb|gbc|gba|n64|z64|v64|nds|iso|bin|cue)$/i,
        ''
    );
    // 2. Underscores → spaces
    const spaced = noExt.replace(/[_]+/g, ' ').trim();
    // 3. Extract region tag present in original name (if any)
    const regionMatch = spaced.match(/\((USA|World|Europe|Japan|PAL|NTSC)[^)]*\)/i);
    const regionTag = regionMatch ? regionMatch[0] : null;
    // 4. Strip ALL parens and brackets → clean base name
    const base = spaced
        .replace(/\s*\([^)]*\)\s*/g, ' ')
        .replace(/\s*\[[^\]]*\]\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const candidates: string[] = [
        regionTag ? `${base} ${regionTag}` : null, // original region first
        `${base} (USA)`,
        `${base} (World)`,
        `${base} (Europe)`,
        `${base} (Japan)`,
        base, // bare name last
    ].filter(Boolean) as string[];

    // Deduplicate while keeping order
    return [...new Set(candidates)];
}

// ─── URL liveness check ────────────────────────────────────────────────────────

export async function isUrlAlive(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, {
            method: 'HEAD',
            headers: FETCH_HEADERS,
            signal: AbortSignal.timeout(5000),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ─── Libretro ─────────────────────────────────────────────────────────────────

/**
 * Find all three Libretro image types for a game.
 * Tries region variants so 90%+ of NES games resolve correctly.
 */
export async function findLibretroImages(
    gameName: string
): Promise<{ boxart: string | null; snap: string | null; title: string | null }> {
    const candidates = getLibretroCandidates(gameName);
    let boxart: string | null = null;
    let snap: string | null = null;
    let title: string | null = null;

    for (const candidate of candidates) {
        const enc = encodeURIComponent(candidate);
        const check = async (type: string) => {
            const url = `${NES_LIBRETRO_BASE}/${type}/${enc}.png`;
            return (await isUrlAlive(url)) ? url : null;
        };
        if (!boxart) boxart = await check('Named_Boxarts');
        if (!snap) snap = await check('Named_Snaps');
        if (!title) title = await check('Named_Titles');
        if (boxart && snap && title) break;
    }

    return { boxart, snap, title };
}

// ─── Wikipedia ────────────────────────────────────────────────────────────────

export async function findWikipediaImage(gameName: string): Promise<string | null> {
    try {
        const clean = gameName.replace(/\s*\([^)]*\)/g, '').trim();
        const q = encodeURIComponent(`${clean} NES game`);
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${q}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
        const res = await fetch(url, { headers: FETCH_HEADERS, signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const data = await res.json();
        const pages = data?.query?.pages || {};
        for (const page of Object.values(pages) as any[]) {
            if (page.thumbnail?.source) return page.thumbnail.source;
        }
    } catch { /* silently fail */ }
    return null;
}

// ─── Google CSE ───────────────────────────────────────────────────────────────

export async function findGoogleImage(gameName: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cx = process.env.GOOGLE_CSE_ID;
    if (!apiKey || !cx) return null;
    try {
        const clean = gameName.replace(/\s*\([^)]*\)/g, '').trim();
        const q = encodeURIComponent(`${clean} NES game cover art box`);
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${q}&num=3&imgType=photo&imgSize=medium`;
        const res = await fetch(url, { headers: FETCH_HEADERS, signal: AbortSignal.timeout(8000) });
        if (!res.ok) return null;
        const data = await res.json();
        for (const item of (data?.items || [])) {
            if (item?.link && await isUrlAlive(item.link)) return item.link;
        }
    } catch { /* silently fail */ }
    return null;
}

// ─── Combined search ──────────────────────────────────────────────────────────

/**
 * Find the best available boxart URL using Libretro → Wikipedia → Google fallback.
 */
export async function findBestImage(
    gameName: string
): Promise<{ url: string; source: string } | null> {
    const libretro = await findLibretroImages(gameName);
    if (libretro.boxart) return { url: libretro.boxart, source: 'Libretro' };

    const wiki = await findWikipediaImage(gameName);
    if (wiki) return { url: wiki, source: 'Wikipedia' };

    const google = await findGoogleImage(gameName);
    if (google) return { url: google, source: 'Google' };

    return null;
}

// ─── Backend update ───────────────────────────────────────────────────────────

/**
 * PUT updated image fields to the Spring Boot admin API.
 * Only the fields in `updates` are changed; all other game fields are preserved.
 */
export async function updateGameImages(
    gameId: number,
    updates: { imageUrl?: string; imageSnap?: string; imageTitle?: string },
    authHeader: string,
    currentGame: any
): Promise<boolean> {
    const payload = {
        name: currentGame.name,
        fileName: currentGame.fileName || '',
        path: currentGame.path || '',
        categoryId: currentGame.categoryId || currentGame.category?.id || 1,
        description: currentGame.description || '',
        rating: currentGame.rating || 0,
        year: currentGame.year || new Date().getFullYear(),
        region: currentGame.region || '',
        isFeatured: currentGame.isFeatured || false,
        imageUrl: updates.imageUrl ?? currentGame.imageUrl ?? '',
        imageSnap: updates.imageSnap ?? currentGame.imageSnap ?? '',
        imageTitle: updates.imageTitle ?? currentGame.imageTitle ?? '',
    };
    try {
        const res = await fetch(`${ADMIN_API}/games/${gameId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: authHeader },
            body: JSON.stringify(payload),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ─── Fetch all games (paginated) ──────────────────────────────────────────────

export async function fetchAllGames(authHeader: string): Promise<any[]> {
    const all: any[] = [];
    let page = 0;
    const size = 100;
    while (true) {
        const res = await fetch(`${ADMIN_API}/games?page=${page}&size=${size}`, {
            headers: { Authorization: authHeader },
        });
        if (!res.ok) break;
        const data = await res.json();
        all.push(...(data?.content || []));
        if (page >= (data?.totalPages || 1) - 1) break;
        page++;
    }
    return all;
}
