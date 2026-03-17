import { NextRequest } from 'next/server';
import {
    fetchAllGames,
    findLibretroImages,
    findWikipediaImage,
    findGoogleImage,
    isUrlAlive,
    updateGameImages,
} from './helpers';

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
                let processedCount = 0;

                // Keep-alive ping to prevent Vercel 504 on long SSE streams
                const pingInterval = setInterval(() => {
                    send({ type: 'ping', time: Date.now() });
                }, 15000);

                try {
                    // Batch of 5 to balance speed vs API rate limits
                    const BATCH_SIZE = 5;
                    for (let i = 0; i < games.length; i += BATCH_SIZE) {
                        const batch = games.slice(i, i + BATCH_SIZE);

                        await Promise.all(batch.map(async (game) => {
                            const { id, name, fileName, imageUrl: currentImageUrl } = game;

                            // Check if current image is alive
                            const hasImage = currentImageUrl && currentImageUrl.startsWith('http');
                            const isAlive = hasImage ? await isUrlAlive(currentImageUrl) : false;

                            if (isAlive) {
                                ok++;
                                send({ type: 'result', id, name, status: 'ok' });
                            } else {
                                const searchName = name || fileName || '';

                                // Try Libretro first (returns all 3 image types)
                                const libretro = await findLibretroImages(searchName);
                                let newUrl: string | null = libretro.boxart;
                                let newSnap: string | null = libretro.snap;
                                let newTitle: string | null = libretro.title;
                                let source = newUrl ? 'Libretro' : '';

                                // Fallback to Wikipedia / Google for boxart only
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
                                        await updateGameImages(
                                            id,
                                            {
                                                imageUrl: newUrl,
                                                ...(newSnap ? { imageSnap: newSnap } : {}),
                                                ...(newTitle ? { imageTitle: newTitle } : {}),
                                            },
                                            authHeader,
                                            game
                                        );
                                    }
                                    send({
                                        type: 'result',
                                        id,
                                        name,
                                        status: 'fixed',
                                        newUrl,
                                        newSnap,
                                        newTitle,
                                        source,
                                    });
                                } else {
                                    notFound++;
                                    send({ type: 'result', id, name, status: 'not_found' });
                                }
                            }

                            processedCount++;
                            send({ type: 'progress', current: processedCount, total: games.length, name });
                        }));

                        // Small delay between batches to respect rate limits
                        await new Promise(r => setTimeout(r, 200));
                    }

                    send({ type: 'done', stats: { total: games.length, fixed, notFound, ok } });
                } finally {
                    clearInterval(pingInterval);
                }
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
