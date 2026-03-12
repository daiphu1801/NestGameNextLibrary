'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';
import {
    ScanSearch, Play, Pause, RotateCcw, CheckCircle2, AlertCircle,
    Loader2, Image as ImageIcon, Save, Wand2, ExternalLink
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ScanStatus = 'idle' | 'scanning' | 'done';

interface BrokenGame {
    id: number;
    name: string;
    fileName?: string;
    currentImageUrl?: string;
    // UI state
    searching?: boolean;
    foundUrl?: string;
    foundSnap?: string;    // Named_Snaps image
    foundTitle?: string;   // Named_Titles image
    foundSource?: string;
    newUrl?: string;   // user-edited manual URL
    saving?: boolean;
    saved?: boolean;
}

interface ScanStats {
    total: number;
    fixed: number;
    ok: number;
    notFound: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function getToken() {
    if (typeof window === 'undefined') return '';
    // accessToken is set by authService.saveTokens() after login
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function GameImagePreview({ url }: { url?: string }) {
    const [ok, setOk] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url) { setOk(false); return; }
        setLoading(true);
        setOk(false);
        const img = new window.Image();
        img.onload = () => { setOk(true); setLoading(false); };
        img.onerror = () => { setOk(false); setLoading(false); };
        img.src = url;
    }, [url]);

    return (
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: '#1C2434', border: '1px solid #2E3A47' }}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#637381' }} />}
            {!loading && ok && <img src={url} alt="" className="w-full h-full object-cover" />}
            {!loading && !ok && <ImageIcon className="w-5 h-5" style={{ color: '#374151' }} />}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminImagesPage() {
    const { showToast } = useToast();
    const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
    const [progress, setProgress] = useState({ current: 0, total: 0, currentName: '' });
    const [stats, setStats] = useState<ScanStats | null>(null);
    const [brokenGames, setBrokenGames] = useState<BrokenGame[]>([]);
    const [autoFixMode, setAutoFixMode] = useState(false); // auto-fix during scan
    const abortRef = useRef<AbortController | null>(null);

    // ── Scan ──────────────────────────────────────────────────────────────────
    const startScan = useCallback(async () => {
        setScanStatus('scanning');
        setProgress({ current: 0, total: 0, currentName: '' });
        setBrokenGames([]);
        setStats(null);

        const ctrl = new AbortController();
        abortRef.current = ctrl;
        const mode = autoFixMode ? 'fix' : 'preview';

        try {
            const res = await fetch(`/api/admin/fix-images?mode=${mode}`, {
                signal: ctrl.signal,
                headers: { 'Authorization': getToken() ? `Bearer ${getToken()}` : '' },
            });

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    try {
                        const ev = JSON.parse(line.slice(5).trim());
                        if (ev.type === 'total') {
                            setProgress(p => ({ ...p, total: ev.total }));
                        } else if (ev.type === 'progress') {
                            setProgress({ current: ev.current, total: ev.total, currentName: ev.name });
                        } else if (ev.type === 'result') {
                            if (ev.status === 'not_found') {
                                setBrokenGames(prev => [...prev, {
                                    id: ev.id, name: ev.name,
                                    currentImageUrl: undefined, newUrl: '',
                                }]);
                            }
                            // if fixed by auto-fix, show with foundUrl
                            if (ev.status === 'fixed' && autoFixMode) {
                                setBrokenGames(prev => [...prev, {
                                    id: ev.id, name: ev.name,
                                    currentImageUrl: ev.newUrl, newUrl: ev.newUrl,
                                    foundUrl: ev.newUrl, foundSnap: ev.newSnap || undefined,
                                    foundTitle: ev.newTitle || undefined,
                                    foundSource: ev.source, saved: true,
                                }]);
                            }
                        } else if (ev.type === 'done') {
                            setStats(ev.stats);
                            setScanStatus('done');
                        } else if (ev.type === 'error') {
                            showToast('error', 'Lỗi quét: ' + ev.message);
                            setScanStatus('done');
                        }
                    } catch { /* skip */ }
                }
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                showToast('error', 'Lỗi kết nối');
            }
            setScanStatus('done');
        }
    }, [autoFixMode, showToast]);

    const stopScan = () => {
        abortRef.current?.abort();
        setScanStatus('done');
    };

    // ── Auto-find single game ─────────────────────────────────────────────────
    const findImageForGame = useCallback(async (gameId: number) => {
        setBrokenGames(prev => prev.map(g => g.id === gameId ? { ...g, searching: true, foundUrl: undefined } : g));
        try {
            const res = await fetch(`/api/admin/fix-images/single?gameId=${gameId}`, {
                headers: { 'Authorization': getToken() ? `Bearer ${getToken()}` : '' },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    setBrokenGames(prev => prev.map(g => g.id === gameId
                        ? { ...g, searching: false, foundUrl: data.url, foundSnap: data.snap || undefined, foundTitle: data.title || undefined, foundSource: data.source, newUrl: data.url }
                        : g
                    ));
                } else {
                    setBrokenGames(prev => prev.map(g => g.id === gameId ? { ...g, searching: false } : g));
                    showToast('error', 'Không tìm được ảnh cho game này');
                }
            }
        } catch {
            setBrokenGames(prev => prev.map(g => g.id === gameId ? { ...g, searching: false } : g));
        }
    }, [showToast]);

    // ── Save URL ──────────────────────────────────────────────────────────────
    const saveImageUrl = useCallback(async (game: BrokenGame) => {
        if (!game.newUrl?.trim()) return;
        setBrokenGames(prev => prev.map(g => g.id === game.id ? { ...g, saving: true } : g));
        try {
            // Fetch full game from public endpoint
            const fullGame = await adminService.getGameById(game.id);
            if (!fullGame) throw new Error('Không tìm thấy game trong DB');

            // Build payload mapping exactly to backend's AdminGameRequest
            const payload = {
                name: fullGame.name,
                fileName: fullGame.fileName,
                path: fullGame.path,
                categoryId: fullGame.categoryId || fullGame.category?.id || 1,
                description: fullGame.description || '',
                rating: fullGame.rating || 0,
                year: fullGame.year || new Date().getFullYear(),
                region: fullGame.region || '',
                isFeatured: fullGame.isFeatured || false,
                imageUrl: game.newUrl?.trim() || fullGame.imageUrl,
                imageSnap: game.foundSnap || fullGame.imageSnap || '',
                imageTitle: game.foundTitle || fullGame.imageTitle || ''
            };

            await adminService.updateGame(game.id, payload);
            setBrokenGames(prev => prev.map(g => g.id === game.id
                ? { ...g, saving: false, saved: true, currentImageUrl: game.newUrl }
                : g
            ));
            showToast('success', `Đã lưu ảnh cho "${game.name}"`);
        } catch (err: any) {
            setBrokenGames(prev => prev.map(g => g.id === game.id ? { ...g, saving: false } : g));
            showToast('error', err?.message || 'Lỗi khi lưu');
        }
    }, [showToast]);

    const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
    const pendingCount = brokenGames.filter(g => !g.saved).length;
    const unsavedFoundCount = brokenGames.filter(g => g.foundUrl && !g.saved).length;

    // ── Save All Found ────────────────────────────────────────────────────────
    const saveAllFound = useCallback(async () => {
        const toSave = brokenGames.filter(g => g.foundUrl && !g.saved && !g.saving);
        for (const game of toSave) {
            await saveImageUrl({ ...game, newUrl: game.newUrl || game.foundUrl });
        }
    }, [brokenGames, saveImageUrl]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản lý Ảnh Game</h1>
                    <p className="text-sm mt-1" style={{ color: '#637381' }}>
                        Quét thư viện, tự động tìm và sửa ảnh bị lỗi
                    </p>
                </div>
                {stats && (
                    <button
                        onClick={() => { setScanStatus('idle'); setBrokenGames([]); setStats(null); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all hover:brightness-110 cursor-pointer"
                        style={{ background: '#24303F', borderColor: '#2E3A47', color: '#A5B4CB' }}
                    >
                        <RotateCcw className="w-4 h-4" /> Quét lại
                    </button>
                )}
            </div>

            {/* Scan Panel */}
            {scanStatus === 'idle' && (
                <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-6" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <ScanSearch className="w-8 h-8" style={{ color: '#F59E0B' }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Quét Ảnh Lỗi</h2>
                        <p className="text-sm max-w-md" style={{ color: '#637381' }}>
                            Hệ thống sẽ kiểm tra từng game trong DB, phát hiện ảnh bị lỗi và tự động tìm ảnh thay thế từ Libretro → Wikipedia → Google.
                        </p>
                    </div>

                    {/* Auto-fix toggle */}
                    <label className="flex items-center gap-3 px-5 py-3 rounded-xl cursor-pointer border transition-all" style={{ background: autoFixMode ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', borderColor: autoFixMode ? '#10B981' : '#2E3A47' }} onClick={() => setAutoFixMode(!autoFixMode)}>
                        <div className={`w-10 h-5 rounded-full transition-all relative ${autoFixMode ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${autoFixMode ? 'left-5' : 'left-0.5'}`} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-white">Tự động sửa khi tìm được</p>
                            <p className="text-xs" style={{ color: '#637381' }}>{autoFixMode ? 'Sẽ cập nhật DB luôn khi tìm được ảnh' : 'Chỉ hiển thị, không tự sửa'}</p>
                        </div>
                    </label>

                    <button
                        onClick={startScan}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
                    >
                        <Play className="w-4 h-4 fill-current" /> Bắt đầu Quét
                    </button>
                </div>
            )}

            {/* Progress Bar (scanning) */}
            {scanStatus === 'scanning' && (
                <div className="rounded-2xl p-6 space-y-4" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#F59E0B' }} />
                            <div>
                                <p className="text-sm font-semibold text-white">Đang quét thư viện...</p>
                                <p className="text-xs truncate max-w-sm" style={{ color: '#637381' }}>{progress.currentName || 'Khởi động...'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-bold" style={{ color: '#F59E0B' }}>{progress.current} / {progress.total || '?'}</span>
                            <button onClick={stopScan} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border hover:brightness-110 transition-all cursor-pointer" style={{ background: 'rgba(251,84,84,0.08)', borderColor: '#FB5454', color: '#FB5454' }}>
                                <Pause className="w-4 h-4" /> Dừng
                            </button>
                        </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1C2434' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #F59E0B, #10B981)' }} />
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#637381' }}>
                        <span className="text-amber-400 font-semibold">{brokenGames.length}</span> game chưa có ảnh tìm thấy cho đến nay
                    </div>
                </div>
            )}

            {/* Stats (after scan) */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Tổng đã quét', value: stats.total, color: '#A5B4CB', bg: 'rgba(165,180,203,0.08)' },
                        { label: 'Đã có ảnh OK', value: stats.ok, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                        { label: 'Đã tự fix', value: stats.fixed, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                        { label: 'Chưa có ảnh', value: stats.notFound, color: '#FB5454', bg: 'rgba(251,84,84,0.08)' },
                    ].map(item => (
                        <div key={item.label} className="rounded-xl p-4 text-center" style={{ background: item.bg, border: `1px solid ${item.color}20` }}>
                            <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
                            <p className="text-xs mt-1" style={{ color: '#637381' }}>{item.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Broken Games List */}
            {brokenGames.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            Game chưa có ảnh
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(251,84,84,0.15)', color: '#FB5454' }}>{pendingCount} cần xử lý</span>
                        </h2>
                        {unsavedFoundCount > 0 && (
                            <button
                                onClick={saveAllFound}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border hover:brightness-110 transition-all cursor-pointer"
                                style={{ background: 'rgba(16,185,129,0.1)', borderColor: '#10B981', color: '#10B981' }}
                            >
                                <Save className="w-3.5 h-3.5" />
                                Lưu tất cả ({unsavedFoundCount})
                            </button>
                        )}
                    </div>

                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2E3A47' }}>
                        {brokenGames.map((game, i) => (
                            <div key={game.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0" style={{ background: game.saved ? 'rgba(16,185,129,0.04)' : i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', borderColor: '#2E3A47' }}>
                                {/* Thumbnail preview */}
                                <GameImagePreview url={game.foundUrl || game.currentImageUrl} />

                                {/* Game info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{game.name}</p>
                                    {game.foundSource && (
                                        <p className="text-xs mt-0.5" style={{ color: '#10B981' }}>Tìm được từ {game.foundSource}</p>
                                    )}
                                    {/* URL Input */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="url"
                                            value={game.newUrl || ''}
                                            onChange={e => setBrokenGames(prev => prev.map(g => g.id === game.id ? { ...g, newUrl: e.target.value, saved: false } : g))}
                                            placeholder="Nhập URL ảnh..."
                                            className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-colors"
                                            style={{ background: '#1C2434', border: '1px solid #2E3A47' }}
                                        />
                                        {game.newUrl && game.newUrl.startsWith('http') && (
                                            <a href={game.newUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0" style={{ color: '#637381' }}>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {game.saved ? (
                                        <CheckCircle2 className="w-5 h-5" style={{ color: '#10B981' }} />
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => findImageForGame(game.id)}
                                                disabled={game.searching}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer hover:brightness-110 disabled:opacity-50"
                                                style={{ background: 'rgba(60,80,224,0.1)', borderColor: '#3C50E0', color: '#3C50E0' }}
                                                title="Tự tìm ảnh"
                                            >
                                                {game.searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                Tìm
                                            </button>
                                            <button
                                                onClick={() => saveImageUrl(game)}
                                                disabled={!game.newUrl?.trim() || game.saving}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer hover:brightness-110 disabled:opacity-50"
                                                style={{ background: 'rgba(16,185,129,0.1)', borderColor: '#10B981', color: '#10B981' }}
                                            >
                                                {game.saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                Lưu
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state after scan */}
            {scanStatus === 'done' && brokenGames.length === 0 && (
                <div className="rounded-2xl p-12 flex flex-col items-center gap-4" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                    <CheckCircle2 className="w-12 h-12" style={{ color: '#10B981' }} />
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white">Tất cả game đều có ảnh!</h3>
                        <p className="text-sm mt-1" style={{ color: '#637381' }}>Không tìm thấy game nào bị thiếu ảnh sau khi quét.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
