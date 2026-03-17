'use client';

import { useEffect, useState, useRef } from 'react';
import { Game, Category } from '@/types';
import { adminService } from '@/services/adminService';
import { gameService } from '@/services/gameService';
import { 
    Loader2, Crown, Trophy, Calendar, Gamepad2, 
    AlertCircle, Plus, ImageIcon, Wand2, Info,
    CheckCircle2, FileUp, Search
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';

// --- Constants & Helpers ---
const ROM_FOLDERS = [
    'Nes ROMs Complete 1 Of 4',
    'Nes ROMs Complete 2 Of 4',
    'Nes ROMs Complete 3 Of 4',
    'Nes ROMs Complete 4 Of 4',
];

const SYSTEMS = [
    { id: 'ps1', name: 'PlayStation 1' },
    { id: 'psp', name: 'PSP' },
    { id: 'nes', name: 'NES' },
    { id: 'snes', name: 'SNES' },
    { id: 'gba', name: 'Game Boy Advance' },
    { id: 'genesis', name: 'Sega Genesis' },
];

function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function stripRomExt(fileName: string): string {
    return fileName.replace(/\.(nes|zip|NES|ZIP|sfc|smc|gba|md|gen|bin|iso|img|pbp)$/i, '').trim();
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

// --- Sub-components ---

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
                    <span className="text-[#FB5454] text-[10px]">Không tải được</span>
                </div>
            )}
        </div>
    );
}

function RomDropZone({ onUploaded }: { onUploaded: (fileName: string, path: string) => void }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState<{ fileName: string; path: string; sizeBytes: number; mode?: string } | null>(null);
    const [error, setError] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(ROM_FOLDERS[0]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const supported = ['nes', 'sfc', 'smc', 'gba', 'md', 'gen', 'bin', 'zip', 'iso', 'img', 'pbp'];
        if (!supported.includes(ext || '')) {
            setError('Định dạng file không được hỗ trợ!');
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

    return (
        <div className="space-y-3">
            {!uploaded && (
                <div>
                    <label className="block text-xs font-semibold text-[#8A99AF] mb-1.5 uppercase tracking-wider">Thư mục đích (Local)</label>
                    <select
                        value={selectedFolder}
                        onChange={e => setSelectedFolder(e.target.value)}
                        className="w-full bg-[#1C2434] border border-[#2E3A47] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                        {ROM_FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            )}

            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if(f) handleFile(f); }}
                className="relative rounded-xl p-8 text-center cursor-pointer transition-all min-h-[160px] flex items-center justify-center border-2 border-dashed"
                style={{
                    background: dragging ? 'rgba(60,80,224,0.08)' : '#1C2434',
                    borderColor: dragging ? '#3C50E0' : uploaded ? '#10B981' : '#2E3A47',
                }}
            >
                <input ref={inputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleFile(f); }} />

                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <span className="text-[#A5B4CB] text-sm font-medium">Đang tải lên ROM...</span>
                    </div>
                ) : uploaded ? (
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-bold">{uploaded.fileName}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${uploaded.mode === 'r2' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/20 text-primary'}`}>
                                {uploaded.mode === 'r2' ? 'Cloudflare R2' : 'Local'}
                            </span>
                        </div>
                        <p className="text-[#637381] text-xs">{fmtSize(uploaded.sizeBytes)} · Đã sẵn sàng</p>
                        <button type="button" onClick={e => { e.stopPropagation(); setUploaded(null); onUploaded('', ''); }} className="text-xs text-[#A5B4CB] hover:text-white underline mt-2">Thay file khác</button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileUp className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold">Kéo thả ROM vào đây</p>
                            <p className="text-[#637381] text-[11px] mt-1">Hỗ trợ .nes, .sfc, .gba, .zip, .iso, .pbp...</p>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-[#FB5454] text-xs flex items-center gap-1 font-medium"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
        </div>
    );
}

function RAWGImageFinder({ onApply }: { onApply: (data: any) => void }) {
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setSearching(true); setError(''); setResults([]);
        try {
            const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
            if (!apiKey) throw new Error('Thiếu RAWG API Key in .env');
            const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${apiKey}&page_size=5`);
            const data = await res.json();
            if (data.results?.length > 0) { setResults(data.results); setSelectedIdx(0); }
            else setError('Không tìm thấy kết quả nào.');
        } catch (err: any) { setError(err.message); }
        finally { setSearching(false); }
    };

    const handleSelect = () => {
        const game = results[selectedIdx];
        const boxart = game.background_image || '';
        const screenshots = game.short_screenshots || [];
        const snap = screenshots.length > 0 ? screenshots[0].image : boxart;
        const title = screenshots.length > 1 ? screenshots[1].image : snap;
        onApply({
            name: game.name,
            year: game.released ? parseInt(game.released.split('-')[0]) : new Date().getFullYear(),
            description: `Khám phá ngay siêu phẩm ${game.name} - Game tiêu điểm của tháng này với đồ họa đỉnh cao và lối chơi hấp dẫn.`,
            imageUrl: boxart,
            imageSnap: snap,
            imageTitle: title
        });
    };

    return (
        <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center gap-2 text-primary">
                <Search className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Metadata từ RAWG</span>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" value={query} onChange={e => setQuery(e.target.value)} 
                    placeholder="Tìm tên game..." 
                    className="flex-1 bg-[#1C2434] border border-[#2E3A47] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button type="button" onClick={handleSearch} disabled={searching} className="bg-primary text-white p-2 rounded-lg hover:brightness-110">
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
            </div>
            {results.length > 0 && (
                <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {results.map((g, i) => (
                            <div key={g.id} onClick={() => setSelectedIdx(i)} className={`flex-shrink-0 w-32 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${i === selectedIdx ? 'border-primary' : 'border-[#2E3A47] opacity-60'}`}>
                                <img src={g.background_image} className="aspect-video w-full object-cover" />
                                <p className="p-1.5 text-[10px] text-white font-bold truncate">{g.name}</p>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleSelect} className="w-full py-2 bg-primary/20 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-primary/30">
                        ÁP DỤNG THÔNG TIN & ẢNH
                    </button>
                </div>
            )}
            {error && <p className="text-rose-500 text-[10px]">{error}</p>}
        </div>
    );
}

// --- Main Page Component ---

export default function AdminGameMonthPage() {
    const [gotm, setGotm] = useState<Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const emptyForm = {
        name: '',
        system: 'ps1',
        categoryId: '',
        description: '',
        rating: 4.5,
        year: new Date().getFullYear(),
        region: 'US',
        fileName: '',
        path: '',
        imageUrl: '',
        imageSnap: '',
        imageTitle: '',
        period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    };
    const [form, setForm] = useState(emptyForm);

    const { showToast } = useToast();

    // Load current GOTM and categories
    useEffect(() => {
        const init = async () => {
            try {
                const [current, cats] = await Promise.all([
                    gameService.getGameOfTheMonth(),
                    adminService.getCategories()
                ]);
                setGotm(current || null);
                setCategories(cats);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu', error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.fileName || !form.path) {
            showToast('error', 'Vui lòng cung cấp đầy đủ Tên, File ROM và Đường dẫn!');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...form,
                categoryId: form.categoryId ? Number(form.categoryId) : null,
                rating: Number(form.rating),
                year: Number(form.year),
                isFeatured: true,
                isGameOfMonth: true,
                gameOfMonthPeriod: form.period
            };

            await adminService.createGame(payload);
            showToast('success', 'Đã thiết lập Game Của Tháng mới thành công!');
            
            const current = await gameService.getGameOfTheMonth();
            setGotm(current || null);
            setForm(emptyForm);
        } catch (error: any) {
            showToast('error', error.message || 'Lỗi khi tạo game');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#3C50E0] animate-spin" />
            </div>
        );
    }

    const inputCls = "w-full bg-[#1C2434] border border-[#2E3A47] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm";
    const labelCls = "block text-xs font-black text-[#8A99AF] mb-1.5 uppercase tracking-widest";

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Crown className="w-6 h-6 text-amber-500" />
                        Quản lý Game Của Tháng
                    </h1>
                    <p className="text-[#8A99AF] text-sm mt-1">
                        Thiết lập siêu phẩm tiêu điểm xuất hiện trên trang đích của hệ thống.
                    </p>
                </div>
            </div>

            {/* Current GOTM View */}
            <div className="bg-[#24303F] border border-[#2E3A47] rounded-xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-[#2E3A47] bg-[#1C2434]/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Tâm điểm hiện tại
                    </h2>
                    {gotm && <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest animate-pulse">● Đang hiển thị</span>}
                </div>
                <div className="p-8">
                    {gotm ? (
                        <div className="flex flex-col md:flex-row gap-10">
                            <div className="w-full md:w-48 aspect-[3/4] rounded-2xl overflow-hidden bg-black/50 border border-[#2E3A47] shadow-xl">
                                {gotm.imageUrl ? <img src={gotm.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-12 h-12 text-[#333A48]" /></div>}
                            </div>
                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">{gotm.system}</span>
                                        <span className="text-[#8A99AF] font-mono text-xs">Phát hành: {gotm.year}</span>
                                    </div>
                                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{gotm.name}</h3>
                                    <p className="text-amber-500 font-bold text-sm mt-1">Chu kỳ: {gotm.gameOfMonthPeriod}</p>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-y border-[#2E3A47]/50">
                                    <div className="space-y-1"><span className="text-[10px] text-[#637381] font-bold uppercase">Xếp hạng</span><p className="text-lg font-black text-white">{gotm.rating?.toFixed(1)} / 5.0</p></div>
                                    <div className="space-y-1"><span className="text-[10px] text-[#637381] font-bold uppercase">Khu vực</span><p className="text-lg font-black text-white">{gotm.region}</p></div>
                                    <div className="space-y-1"><span className="text-[10px] text-[#637381] font-bold uppercase">Lượt chơi</span><p className="text-lg font-black text-white">{gotm.playCount?.toLocaleString()}</p></div>
                                    <div className="space-y-1"><span className="text-[10px] text-[#637381] font-bold uppercase">Danh mục</span><p className="text-lg font-black text-white">{gotm.categoryName || 'Common'}</p></div>
                                </div>
                                <p className="text-sm text-[#A5B4CB] leading-relaxed italic">&ldquo;{gotm.description}&rdquo;</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-[#333A48] mx-auto mb-4" />
                            <p className="text-[#8A99AF] font-medium">Chưa có Game Của Tháng. Hãy sử dụng biểu mẫu phía dưới.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Creation Form */}
            <div className="bg-[#24303F] border border-[#2E3A47] rounded-xl overflow-hidden shadow-lg">
                <form onSubmit={handleSave} className="p-8 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left: Metadata Form */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className={labelCls}>Tên siêu phẩm *</label>
                                        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ví dụ: Resident Evil 2" className={inputCls} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Hệ máy</label>
                                            <select value={form.system} onChange={e => setForm(f => ({ ...f, system: e.target.value }))} className={inputCls}>
                                                {SYSTEMS.map(sys => <option key={sys.id} value={sys.id}>{sys.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Năm</label>
                                            <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} className={inputCls} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Mô tả đặc biệt</label>
                                        <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Giới thiệu về game..." />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Xếp hạng</label>
                                            <input type="number" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Phân vùng</label>
                                            <input type="text" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className={inputCls} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Danh mục</label>
                                        <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={inputCls}>
                                            <option value="">-- Chọn --</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Tháng hiển thị</label>
                                        <input type="month" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className={inputCls} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-[#2E3A47]/50">
                                <h3 className={labelCls}>Tải lên ROM & Đường dẫn *</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <RomDropZone onUploaded={(fileName, path) => setForm(f => ({ ...f, fileName, path }))} />
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] text-[#8A99AF] font-bold uppercase mb-1 block">File Name</label>
                                            <input type="text" readOnly value={form.fileName} placeholder="Tự động khi upload..." className={`${inputCls} bg-black/20 opacity-70`} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[#8A99AF] font-bold uppercase mb-1 block">ROM Link (Path)</label>
                                            <input type="text" readOnly value={form.path} placeholder="Tự động khi upload..." className={`${inputCls} bg-black/20 opacity-70`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Images & Helpers */}
                        <div className="lg:col-span-4 space-y-6">
                            <RAWGImageFinder onApply={data => setForm(f => ({ ...f, ...data }))} />
                            
                            <div className="space-y-4 pt-4 border-t border-[#2E3A47]/50">
                                <h3 className={labelCls}>Xem trước hình ảnh</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-[#637381] font-bold uppercase mb-1 block">Cover Art</label>
                                        <ImagePreview url={form.imageUrl} label="Cover" />
                                        <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className={`${inputCls} mt-2 text-[11px] h-9`} placeholder="https://..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-[#637381] font-bold uppercase mb-1 block">Snap</label>
                                            <ImagePreview url={form.imageSnap} label="Gameplay" />
                                            <input type="text" value={form.imageSnap} onChange={e => setForm(f => ({ ...f, imageSnap: e.target.value }))} className={`${inputCls} mt-2 text-[11px] h-9`} placeholder="https://..." />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[#637381] font-bold uppercase mb-1 block">Title</label>
                                            <ImagePreview url={form.imageTitle} label="Title" />
                                            <input type="text" value={form.imageTitle} onChange={e => setForm(f => ({ ...f, imageTitle: e.target.value }))} className={`${inputCls} mt-2 text-[11px] h-9`} placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[#2E3A47] flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 text-white font-black px-12 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Kích hoạt Game Của Tháng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
