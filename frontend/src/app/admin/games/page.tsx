'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Plus, Pencil, Trash2, X, Star, ChevronLeft, ChevronRight,
    Loader2, Download, Upload, FolderOpen, Image as ImageIcon,
    Wand2, CheckCircle2, AlertCircle, FileUp, Search
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ActionButton } from '../components/ActionButton';

// �"?�"?�"? Constants �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
const REGIONS = ['', 'JP', 'US', 'EU', 'World', 'KR', 'AU', 'FR', 'DE', 'IT', 'SP'];
const ROM_FOLDERS = [
    'Nes ROMs Complete 1 Of 4',
    'Nes ROMs Complete 2 Of 4',
    'Nes ROMs Complete 3 Of 4',
    'Nes ROMs Complete 4 Of 4',
];

// �"?�"?�"? Helpers �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
function toSlug(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\(\)\[\]!]/g, '');
}

/** Given a base URL, auto-derive imageUrl / imageSnap / imageTitle by swapping extension */
function deriveImageUrls(base: string): { imageUrl: string; imageSnap: string; imageTitle: string } {
    if (!base) return { imageUrl: '', imageSnap: '', imageTitle: '' };
    const noExt = base.replace(/\.[a-zA-Z0-9]+$/, '');
    return {
        imageUrl: `${noExt}.jpg`,
        imageSnap: `${noExt}s.jpg`,
        imageTitle: `${noExt}t.jpg`,
    };
}

const LIBRETRO_BASE = 'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System';

/** Build 3 Libretro thumbnail URLs from a game name (without extension) */
function buildLibretroUrls(gameName: string): { boxart: string; snap: string; title: string } {
    const encoded = encodeURIComponent(gameName);
    return {
        boxart: `${LIBRETRO_BASE}/Named_Boxarts/${encoded}.png`,
        snap: `${LIBRETRO_BASE}/Named_Snaps/${encoded}.png`,
        title: `${LIBRETRO_BASE}/Named_Titles/${encoded}.png`,
    };
}

/** Strip ROM file extension from a fileName */
function stripRomExt(fileName: string): string {
    return fileName.replace(/\.(nes|zip|NES|ZIP)$/, '').trim();
}

/** Format bytes */
function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// �"?�"?�"? Image Preview Component �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
function ImagePreview({ url, label }: { url: string; label: string }) {
    const [ok, setOk] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url) { setOk(false); return; }
        setLoading(true);
        const img = new window.Image();
        img.onload = () => { setOk(true); setLoading(false); };
        img.onerror = () => { setOk(false); setLoading(false); };
        img.src = url;
    }, [url]);

    if (!url) return (
        <div className="aspect-video rounded-md flex flex-col items-center justify-center gap-1" style={{ background: '#1C2434', border: '1px dashed #2E3A47' }}>
            <ImageIcon className="w-5 h-5 text-[#637381]" />
            <span className="text-[#637381] text-[10px]">{label}</span>
        </div>
    );

    return (
        <div className="aspect-video rounded-md overflow-hidden relative" style={{ border: '1px solid #2E3A47' }}>
            {loading && <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#1C2434' }}><Loader2 className="w-4 h-4 animate-spin text-[#3C50E0]" /></div>}
            {ok ? (
                <img src={url} alt={label} className="w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: '#1C2434' }}>
                    <AlertCircle className="w-4 h-4 text-[#FB5454]" />
                    <span className="text-[#FB5454] text-[10px]">Không tải �'ược</span>
                </div>
            )}
        </div>
    );
}

// �"?�"?�"? ROM Upload Drop Zone �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
interface RomDropZoneProps {
    onUploaded: (fileName: string, path: string) => void;
}

function RomDropZone({ onUploaded }: RomDropZoneProps) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState<{ fileName: string; path: string; sizeBytes: number; mode?: string } | null>(null);
    const [error, setError] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(ROM_FOLDERS[0]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['nes', 'zip'].includes(ext || '')) {
            setError('Ch�? h�- trợ file .nes hoặc .zip');
            return;
        }
        setError('');
        setUploading(true);
        try {
            const result = await adminService.uploadRom(file, selectedFolder);
            setUploaded(result as any);
            onUploaded(result.fileName, result.path);
        } catch (err: any) {
            setError(err.message || 'Upload thất bại');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const isCloudinaryMode = uploaded?.mode === 'cloudinary';

    return (
        <div className="space-y-3">
            {/* Folder selector �?" only show for local mode */}
            {!isCloudinaryMode && !uploaded && (
                <div>
                    <label className="block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider">Thư mục �'ích (Local)</label>
                    <select
                        value={selectedFolder}
                        onChange={e => setSelectedFolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-md text-white text-sm border focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50"
                        style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                    >
                        {ROM_FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            )}

            {/* Drop zone */}
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className="relative rounded-md p-6 text-center cursor-pointer transition-all"
                style={{
                    background: dragging ? 'rgba(60,80,224,0.08)' : '#1C2434',
                    border: `2px dashed ${dragging ? '#3C50E0' : uploaded ? '#10B981' : '#2E3A47'}`,
                }}
            >
                <input ref={inputRef} type="file" accept=".nes,.zip" className="hidden" onChange={onInputChange} />

                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#3C50E0' }} />
                        <span className="text-[#A5B4CB] text-sm">Đang upload...</span>
                    </div>
                ) : uploaded ? (
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
                        <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium">{uploaded.fileName}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={uploaded.mode === 'cloudinary'
                                ? { background: 'rgba(16,185,129,0.15)', color: '#10B981' }
                                : { background: 'rgba(60,80,224,0.15)', color: '#6577F3' }}>
                                {uploaded.mode === 'cloudinary' ? '☁️ Cloudinary' : '💾 Local'}
                            </span>
                        </div>
                        <p className="text-[#637381] text-xs max-w-xs truncate">{fmtSize(uploaded.sizeBytes)} · {uploaded.path}</p>
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setUploaded(null); onUploaded('', ''); }}
                            className="text-xs text-[#A5B4CB] hover:text-white underline mt-1"
                        >
                            Đổi file khác
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(60,80,224,0.1)' }}>
                            <FileUp className="w-6 h-6" style={{ color: '#3C50E0' }} />
                        </div>
                        <p className="text-white text-sm font-medium">Kéo thả hoặc click để chọn ROM</p>
                        <p className="text-[#637381] text-xs">Hỗ trợ .nes · .zip</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-[#FB5454] text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{error}
                </p>
            )}
        </div>
    );
}

// --------------------------------------------------------------------------------------------------------------------- Libretro Image Finder ---------------------------------------------------------------------------------------------------------------------
interface LibretroFinderProps {
    defaultName?: string;
    onApply: (imageUrl: string, imageSnap: string, imageTitle: string) => void;
}

type ImgStatus = 'idle' | 'loading' | 'found' | 'notfound';

function LibretroFinder({ defaultName = '', onApply }: LibretroFinderProps) {
    const [query, setQuery] = useState(defaultName);
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<{ boxart: string; snap: string; title: string } | null>(null);
    const [statuses, setStatuses] = useState<{ boxart: ImgStatus; snap: ImgStatus; title: ImgStatus }>({ boxart: 'idle', snap: 'idle', title: 'idle' });

    // Sync default name when fileName changes from ROM upload
    useEffect(() => {
        if (defaultName && defaultName !== query) setQuery(defaultName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultName]);

    const checkImage = (url: string, key: 'boxart' | 'snap' | 'title') =>
        new Promise<boolean>(resolve => {
            const img = new window.Image();
            img.onload = () => { setStatuses(s => ({ ...s, [key]: 'found' })); resolve(true); };
            img.onerror = () => { setStatuses(s => ({ ...s, [key]: 'notfound' })); resolve(false); };
            img.src = url;
        });

    const handleSearch = async () => {
        if (!query.trim()) return;
        const name = stripRomExt(query.trim());
        const urls = buildLibretroUrls(name);
        setResults(urls);
        setStatuses({ boxart: 'loading', snap: 'loading', title: 'loading' });
        setSearching(true);
        await Promise.all([
            checkImage(urls.boxart, 'boxart'),
            checkImage(urls.snap, 'snap'),
            checkImage(urls.title, 'title'),
        ]);
        setSearching(false);
    };

    const foundCount = Object.values(statuses).filter(s => s === 'found').length;

    const statusBadge = (s: ImgStatus) => {
        if (s === 'loading') return <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#3C50E0' }} />;
        if (s === 'found') return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>✓ Tìm thấy</span>;
        if (s === 'notfound') return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,84,84,0.12)', color: '#FB5454' }}>✗ Không có</span>;
        return null;
    };

    const imgPanels = results ? [
        { key: 'boxart' as const, url: results.boxart, label: 'Box Art' },
        { key: 'snap' as const, url: results.snap, label: 'Snap' },
        { key: 'title' as const, url: results.title, label: 'Title' },
    ] : [];

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#637381]" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Ví dụ: Super Mario Bros (USA)"
                        className="w-full pl-8 pr-3 py-2 rounded-md text-white text-sm border focus:outline-none focus:ring-1 focus:ring-[#10B981]/50 transition-colors"
                        style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={!query.trim() || searching}
                    className="flex items-center gap-1.5 px-4 rounded-md text-white text-sm font-semibold disabled:opacity-50 transition-all hover:brightness-105 flex-shrink-0 cursor-pointer"
                    style={{ background: '#10B981' }}
                >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Tìm
                </button>
            </div>

            {/* Preview grid */}
            {results && (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        {imgPanels.map(({ key, url, label }) => (
                            <div key={key} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-[#A5B4CB]">{label}</span>
                                    {statusBadge(statuses[key])}
                                </div>
                                <div className="aspect-video rounded-md overflow-hidden" style={{ border: '1px solid #2E3A47' }}>
                                    {statuses[key] === 'found' ? (
                                        <img src={url} alt={label} className="w-full h-full object-cover" />
                                    ) : statuses[key] === 'loading' ? (
                                        <div className="w-full h-full flex items-center justify-center" style={{ background: '#1C2434' }}>
                                            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#3C50E0' }} />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ background: '#1C2434' }}>
                                            <AlertCircle className="w-4 h-4 text-[#637381]" />
                                            <span className="text-[#637381] text-[10px]">Không tìm thấy</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Apply button */}
                    {foundCount > 0 && (
                        <button
                            type="button"
                            onClick={() => onApply(
                                statuses.boxart === 'found' ? results.boxart : '',
                                statuses.snap === 'found' ? results.snap : '',
                                statuses.title === 'found' ? results.title : '',
                            )}
                            className="w-full py-2 rounded-md text-white text-sm font-semibold transition-all hover:brightness-105 cursor-pointer flex items-center justify-center gap-2"
                            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981' }}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Áp dụng {foundCount}/3 ảnh tìm được
                        </button>
                    )}
                    {foundCount === 0 && !searching && (
                        <p className="text-center text-[#637381] text-xs">
                            Không tìm thấy ảnh nào · Thử đổi tên (ví dụ thêm "(USA)" hoặc "(JU)")
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// --------------------------------------------------------------------------------------------------------------------- Main Component ---------------------------------------------------------------------------------------------------------------------
function AdminGamesContent() {
    const [games, setGames] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const search = searchParams.get('q') || '';
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [togglingFeatured, setTogglingFeatured] = useState<number | null>(null);
    const { showToast } = useToast();
    const SIZE = 15;

    const emptyForm = {
        name: '', fileName: '', path: '', categoryId: '' as any,
        description: '', rating: '', year: '', region: '',
        isFeatured: false,
        imageBaseUrl: '', // NEW: used to auto-derive the 3 image fields
        imageUrl: '', imageSnap: '', imageTitle: '',
    };
    const [form, setForm] = useState(emptyForm);

    // --------------------------------------------------------------------------------------------------------------------- Data loading ---------------------------------------------------------------------------------------------------------------------
    const loadGames = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getGames(page, SIZE, search || undefined);
            setGames(data.content);
            setTotal(data.totalElements);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { loadGames(); }, [loadGames]);
    useEffect(() => { setPage(0); }, [search]);
    useEffect(() => { adminService.getCategories().then(setCategories).catch(console.error); }, []);

    // --------------------------------------------------------------------------------------------------------------------- Auto-fill helpers ---------------------------------------------------------------------------------------------------------------------
    const autoFillFromName = (name: string) => {
        if (!form.fileName && !editingGame) {
            setForm(f => ({ ...f, name, fileName: name }));
        } else {
            setForm(f => ({ ...f, name }));
        }
    };

    const applyImageBaseUrl = (base: string) => {
        const derived = deriveImageUrls(base);
        setForm(f => ({ ...f, imageBaseUrl: base, ...derived }));
    };

    const onRomUploaded = (fileName: string, path: string) => {
        setForm(f => ({ ...f, fileName, path }));
    };

    // --------------------------------------------------------------------------------------------------------------------- Modal helpers ---------------------------------------------------------------------------------------------------------------------
    const openCreate = () => {
        setEditingGame(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (game: any) => {
        setEditingGame(game);
        setForm({
            name: game.name || '',
            fileName: game.fileName || '',
            path: game.path || '',
            categoryId: game.categoryId || '',
            description: game.description || '',
            rating: game.rating || '',
            year: game.year || '',
            region: game.region || '',
            isFeatured: game.isFeatured || false,
            imageBaseUrl: '',
            imageUrl: game.imageUrl || '',
            imageSnap: game.imageSnap || '',
            imageTitle: game.imageTitle || '',
        });
        setModalOpen(true);
    };

    // --------------------------------------------------------------------------------------------------------------------- Save ---------------------------------------------------------------------------------------------------------------------
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                categoryId: form.categoryId ? Number(form.categoryId) : null,
                rating: form.rating ? Number(form.rating) : null,
                year: form.year ? Number(form.year) : null,
            };
            if (editingGame) {
                await adminService.updateGame(editingGame.id, payload);
                showToast('success', 'Cập nhật game thành công!');
            } else {
                await adminService.createGame(payload);
                showToast('success', 'Tạo game mới thành công!');
            }
            setModalOpen(false);
            loadGames();
        } catch (err: any) { showToast('error', err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminService.deleteGame(deleteTarget.id);
            setDeleteTarget(null);
            loadGames();
            showToast('success', 'Đã xóa game thành công!');
        } catch (err: any) { showToast('error', err.message); }
    };

    const handleToggleFeatured = async (gameId: number) => {
        setTogglingFeatured(gameId);
        try {
            await adminService.toggleFeatured(gameId);
            setGames(prev => prev.map(g => g.id === gameId ? { ...g, isFeatured: !g.isFeatured } : g));
        } catch (err: any) { showToast('error', err.message); }
        finally { setTogglingFeatured(null); }
    };

    const [reseeding, setReseeding] = useState(false);

    const handleReseed = async () => {
        if (!confirm('Sync games.json vào database? Chỉ thêm game mới, không xóa/sửa game cũ.')) return;
        setReseeding(true);
        try {
            const result = await adminService.reseedGames();
            showToast('success', `✅ Thêm ${result.added} game mới, bỏ qua ${result.skipped} trùng lặp`);
            loadGames();
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setReseeding(false);
        }
    };

    const exportCSV = () => {
        const headers = ['ID', 'Name', 'Category', 'Region', 'Rating', 'Play Count', 'Featured', 'Year'];
        const rows = games.map(g => [g.id, g.name, g.categoryName || '', g.region || '', g.rating || '', g.playCount || 0, g.isFeatured ? 'Yes' : 'No', g.year || '']);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `games_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(total / SIZE);
    const inputCls = "w-full px-3 py-2.5 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors border";
    const inputStyle = { background: '#1C2434', borderColor: '#2E3A47' };
    const labelCls = "block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider";

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-end gap-2">
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[#A5B4CB] text-sm border hover:text-white transition-all cursor-pointer" style={{ borderColor: '#2E3A47', background: '#24303F' }} title="Xuất CSV">
                    <Download className="w-4 h-4" /> CSV
                </button>
                <button onClick={handleReseed} disabled={reseeding} className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm border hover:text-white transition-all cursor-pointer disabled:opacity-50" style={{ borderColor: '#2E3A47', background: '#24303F', color: reseeding ? '#637381' : '#A5B4CB' }} title="Sync games.json → DB">
                    {reseeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {reseeding ? 'Đang sync...' : 'Sync DB'}
                </button>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer" style={{ background: '#3C50E0' }}>
                    <Plus className="w-4 h-4" /> Thêm game
                </button>
            </div>

            {/* Table */}
            <div className="rounded-[10px] overflow-hidden border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2E3A47' }}>
                                <th className="text-left px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Tên game</th>
                                <th className="text-left px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Danh mục</th>
                                <th className="text-center px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Region</th>
                                <th className="text-center px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Lượt chơi</th>
                                <th className="text-center px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Featured</th>
                                <th className="text-right px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10"><div className="w-6 h-6 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : games.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-[#637381] text-sm">Không tìm thấy game</td></tr>
                            ) : games.map((game) => (
                                <tr key={game.id} className="transition-colors hover:bg-[#2E3A47]/50" style={{ borderBottom: '1px solid #2E3A47' }}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            {game.imageUrl ? (
                                                <img src={game.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover" style={{ border: '1px solid #2E3A47' }} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-md flex items-center justify-center text-[#637381] text-xs" style={{ background: '#1C2434' }}>N/A</div>
                                            )}
                                            <span className="text-white text-sm font-medium">{game.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-[#A5B4CB] text-sm">{game.categoryName || '—'}</td>
                                    <td className="px-5 py-3.5 text-center text-[#A5B4CB] text-sm">{game.region || '—'}</td>
                                    <td className="px-5 py-3.5 text-center text-sm font-mono" style={{ color: '#3C50E0' }}>{(game.playCount || 0).toLocaleString()}</td>
                                    <td className="px-5 py-3.5 text-center">
                                        <ActionButton
                                            icon={togglingFeatured === game.id ? Loader2 : Star}
                                            label={game.isFeatured ? 'Bỏ nổi bật' : 'Nổi bật'}
                                            onClick={() => handleToggleFeatured(game.id)}
                                            variant="warning"
                                            disabled={togglingFeatured === game.id}
                                            active={game.isFeatured}
                                        />
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <ActionButton icon={Pencil} label="Sửa" onClick={() => openEdit(game)} variant="primary" />
                                            <ActionButton icon={Trash2} label="Xóa" onClick={() => setDeleteTarget(game)} variant="danger" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #2E3A47' }}>
                        <span className="text-[#637381] text-xs">{page * SIZE + 1}—{Math.min((page + 1) * SIZE, total)} / {total}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-md text-[#A5B4CB] hover:text-white hover:bg-[#333A48] disabled:opacity-30 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="px-3 py-1 text-white text-xs font-medium">{page + 1} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-md text-[#A5B4CB] hover:text-white hover:bg-[#333A48] disabled:opacity-30 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* --------------------------------------------------------------------------------------------------------------------- Create/Edit Modal --------------------------------------------------------------------------------------------------------------------- */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="rounded-[12px] w-full max-w-3xl max-h-[92vh] overflow-y-auto border shadow-2xl" style={{ background: '#1C2434', borderColor: '#2E3A47' }}>

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10" style={{ background: '#1C2434', borderBottom: '1px solid #2E3A47' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(60,80,224,0.15)' }}>
                                    {editingGame ? <Pencil className="w-4 h-4" style={{ color: '#3C50E0' }} /> : <Plus className="w-4 h-4" style={{ color: '#3C50E0' }} />}
                                </div>
                                <h3 className="text-white font-semibold text-base">{editingGame ? 'Chỉnh sửa game' : 'Thêm game mới'}</h3>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-[#637381] hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-[#2E3A47]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">

                            {/* --------------------------------------------------------------------------------------------------------------------- Section 1: ROM File Upload --------------------------------------------------------------------------------------------------------------------- */}
                            {!editingGame && (
                                <div className="rounded-[10px] p-4 space-y-3" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Upload className="w-4 h-4" style={{ color: '#3C50E0' }} />
                                        <h4 className="text-white text-sm font-semibold">Upload ROM File</h4>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(60,80,224,0.15)', color: '#6577F3' }}>Tự động điền</span>
                                    </div>
                                    <RomDropZone onUploaded={onRomUploaded} />
                                </div>
                            )}

                            {/* --------------------------------------------------------------------------------------------------------------------- Section 2: Thông tin cơ bản --------------------------------------------------------------------------------------------------------------------- */}
                            <div className="rounded-[10px] p-4 space-y-4" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                                <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4" style={{ color: '#F59E0B' }} />
                                    Thông tin cơ bản
                                </h4>

                                {/* Tên game */}
                                <div>
                                    <label className={labelCls}>Tên game *</label>
                                    <input
                                        value={form.name}
                                        onChange={e => autoFillFromName(e.target.value)}
                                        required
                                        placeholder="Ví dụ: Super Mario Bros"
                                        className={inputCls} style={inputStyle}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* File Name */}
                                    <div>
                                        <label className={labelCls}>
                                            File Name *
                                            {form.fileName && <span className="ml-2 text-[#10B981] normal-case font-normal">✓ Đã điền</span>}
                                        </label>
                                        <input
                                            value={form.fileName}
                                            onChange={e => setForm(f => ({ ...f, fileName: e.target.value }))}
                                            required
                                            placeholder="Ví dụ: Super Mario Bros (JU).nes"
                                            className={inputCls} style={inputStyle}
                                        />
                                    </div>

                                    {/* Path */}
                                    <div>
                                        <label className={labelCls}>
                                            Path *
                                            {form.path && <span className="ml-2 text-[#10B981] normal-case font-normal">✓ Đã điền</span>}
                                        </label>
                                        <input
                                            value={form.path}
                                            onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                                            required
                                            placeholder="Nes ROMs Complete 1 Of 4/..."
                                            className={inputCls} style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Danh mục */}
                                    <div>
                                        <label className={labelCls}>Danh mục</label>
                                        <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                                            className={inputCls} style={inputStyle}>
                                            <option value="">— Chọn —</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                                        </select>
                                    </div>

                                    {/* Region dropdown */}
                                    <div>
                                        <label className={labelCls}>Region</label>
                                        <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                                            className={inputCls} style={inputStyle}>
                                            {REGIONS.map(r => <option key={r} value={r}>{r || '— Chọn —'}</option>)}
                                        </select>
                                    </div>

                                    {/* Năm */}
                                    <div>
                                        <label className={labelCls}>Năm</label>
                                        <input type="number" min="1980" max="2030" value={form.year}
                                            onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                                            placeholder="1985"
                                            className={inputCls} style={inputStyle} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Rating */}
                                    <div>
                                        <label className={labelCls}>Rating (0—5)</label>
                                        <input type="number" step="0.1" min="0" max="5" value={form.rating}
                                            onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                                            placeholder="4.5"
                                            className={inputCls} style={inputStyle} />
                                    </div>

                                    {/* Featured */}
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                            <div
                                                onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}
                                                className="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer flex-shrink-0"
                                                style={{ background: form.isFeatured ? '#3C50E0' : '#2E3A47', width: 40, height: 22 }}
                                            >
                                                <div className="absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform"
                                                    style={{ transform: form.isFeatured ? 'translateX(18px)' : 'translateX(0)' }}
                                                />
                                            </div>
                                            <span className="text-white text-sm">Nổi bật (Featured)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className={labelCls}>Mô tả</label>
                                    <textarea value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        rows={3} placeholder="Viết mô tả ngắn về game..."
                                        className={`${inputCls} resize-none`} style={inputStyle} />
                                </div>
                            </div>

                            {/* --------------------------------------------------------------------------------------------------------------------- Section 3: Hình ảnh --------------------------------------------------------------------------------------------------------------------- */}
                            <div className="rounded-[10px] p-4 space-y-4" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                                <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" style={{ color: '#10B981' }} />
                                    Hình ảnh
                                </h4>

                                {/* --------------------------------------------------------------------------------------------------------------------- Libretro Finder --------------------------------------------------------------------------------------------------------------------- */}
                                <div className="rounded-md p-3 space-y-2" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Search className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                                        <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Tìm ảnh tự động từ Libretro</span>
                                        <span className="text-[10px] text-[#637381]">({'>'}1000 game NES có ảnh)</span>
                                    </div>
                                    <LibretroFinder
                                        defaultName={stripRomExt(form.fileName)}
                                        onApply={(imgUrl, imgSnap, imgTitle) => setForm(f => ({
                                            ...f,
                                            imageBaseUrl: '',
                                            imageUrl: imgUrl || f.imageUrl,
                                            imageSnap: imgSnap || f.imageSnap,
                                            imageTitle: imgTitle || f.imageTitle,
                                        }))}
                                    />
                                </div>

                                <div className="flex items-center gap-3 py-1">
                                    <div className="flex-1 h-px" style={{ background: '#2E3A47' }} />
                                    <span className="text-[11px] text-[#637381]">hoặc nhập tay</span>
                                    <div className="flex-1 h-px" style={{ background: '#2E3A47' }} />
                                </div>

                                {/* Base URL auto-derive */}
                                <div>
                                    <label className={labelCls}>
                                        <span className="flex items-center gap-1.5">
                                            <Wand2 className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                                            URL gốc (tự động tạo 3 URL ảnh)
                                        </span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            value={form.imageBaseUrl}
                                            onChange={e => applyImageBaseUrl(e.target.value)}
                                            placeholder="https://example.com/images/game-name.jpg"
                                            className={`${inputCls} flex-1`} style={inputStyle}
                                        />
                                        {form.imageBaseUrl && (
                                            <button type="button" onClick={() => applyImageBaseUrl(form.imageBaseUrl)}
                                                className="px-3 rounded-md text-white text-xs font-medium transition-colors flex-shrink-0"
                                                style={{ background: '#3C50E0' }}>
                                                Tạo lại
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[#637381] text-[11px] mt-1">
                                        Nhập URL bất kỳ để tự tạo: <code className="text-[#A5B4CB]">.jpg</code> · <code className="text-[#A5B4CB]">s.jpg</code> · <code className="text-[#A5B4CB]">t.jpg</code>
                                    </p>
                                </div>

                                {/* 3 URL fields + preview */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { key: 'imageUrl', label: 'Image URL (Box Art)' },
                                        { key: 'imageSnap', label: 'Image Snap (Screenshot)' },
                                        { key: 'imageTitle', label: 'Image Title (Title Screen)' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="space-y-2">
                                            <label className={labelCls}>{label}</label>
                                            <input
                                                value={(form as any)[key]}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                placeholder="https://..."
                                                className={inputCls} style={inputStyle}
                                            />
                                            <ImagePreview url={(form as any)[key]} label={label} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --------------------------------------------------------------------------------------------------------------------- Actions --------------------------------------------------------------------------------------------------------------------- */}
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 rounded-md text-[#A5B4CB] text-sm font-medium hover:text-white border transition-colors cursor-pointer"
                                    style={{ borderColor: '#2E3A47' }}>
                                    Hủy
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-md text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                                    style={{ background: '#3C50E0' }}>
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingGame ? 'Lưu thay đổi' : 'Tạo game'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Xóa game"
                message={`Bạn có chắc chắn mu�'n xóa game "${deleteTarget?.name}"? Hành �'�Tng này không th�f hoàn tác.`}
                confirmLabel="Xóa"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

        </div>
    );
}

export default function AdminGamesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGamesContent />
        </Suspense>
    );
}
