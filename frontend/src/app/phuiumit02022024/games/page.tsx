'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Plus, Pencil, Trash2, X, Star, ChevronLeft, ChevronRight,
    Loader2, Download, Upload, FolderOpen, Search, ChevronDown, Wand2
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { debounce } from '@/lib/utils';
import { useToast } from '../components/ToastProvider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ActionButton } from '../components/ActionButton';
import { GameGeneralInfoForm } from '@/components/admin/GameGeneralInfoForm';
import { GameMediaForm } from '@/components/admin/GameMediaForm';
import { useGameForm } from '@/features/admin/hooks/useGameForm';

// --- Constants ---
const REGIONS = ['', 'JP', 'US', 'EU', 'World', 'KR', 'AU', 'FR', 'DE', 'IT', 'SP'];
const SYSTEMS = [
    { id: 'nes', name: 'NES' },
    { id: 'snes', name: 'SNES' },
    { id: 'genesis', name: 'Sega Genesis' },
    { id: 'gba', name: 'Game Boy Advance' },
    { id: 'gb', name: 'Game Boy' },
    { id: 'gbc', name: 'Game Boy Color' },
    { id: 'arcade', name: 'Arcade' },
    { id: 'neogeo', name: 'Neo Geo' }
];

// --------------------------------------------------------------------------------------------------------------------- Main Component ---------------------------------------------------------------------------------------------------------------------
function AdminGamesContent() {
    const [games, setGames] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Sync filters from URL
    const search = searchParams.get('q') || '';
    const systemFilter = searchParams.get('system') || 'all';
    const categoryFilter = searchParams.get('category') || 'all';
    const featuredFilter = searchParams.get('featured') || 'all';
    const regionFilter = searchParams.get('region') || 'all';
    const page = parseInt(searchParams.get('page') || '0');

    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [togglingFeatured, setTogglingFeatured] = useState<number | null>(null);
    const [togglingGameOfMonth, setTogglingGameOfMonth] = useState<number | null>(null);
    const { showToast } = useToast();
    const SIZE = 15;

    const { form, setForm, autoFillFromName, applyImageBaseUrl, onRomUploaded, applyRAWGImages, resetForm } = useGameForm();

    // --------------------------------------------------------------------------------------------------------------------- Data loading ---------------------------------------------------------------------------------------------------------------------
    const loadGames = useCallback(async () => {
        setLoading(true);
        try {
            const isFeatured = featuredFilter === 'yes' ? true : featuredFilter === 'no' ? false : undefined;
            const data = await adminService.getGames(
                page, 
                SIZE, 
                search || undefined, 
                categoryFilter === 'all' ? undefined : categoryFilter, 
                systemFilter === 'all' ? undefined : systemFilter,
                isFeatured,
                regionFilter === 'all' ? undefined : regionFilter
            );
            setGames(data.content);
            setTotal(data.totalElements);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search, systemFilter, categoryFilter, featuredFilter, regionFilter]);

    useEffect(() => { loadGames(); }, [loadGames]);

    useEffect(() => { adminService.getCategories().then(setCategories).catch(console.error); }, []);

    // --------------------------------------------------------------------------------------------------------------------- Modal helpers ---------------------------------------------------------------------------------------------------------------------
    const openCreate = () => {
        setEditingGame(null);
        resetForm();
        setModalOpen(true);
    };

    const openEdit = (game: any) => {
        setEditingGame(game);
        resetForm({
            name: game.name || '',
            fileName: game.fileName || '',
            path: game.path || '',
            categoryId: game.categoryId || '',
            system: game.system || 'nes',
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

    const handleToggleGameOfMonth = async (gameId: number) => {
        setTogglingGameOfMonth(gameId);
        try {
            await adminService.setGameOfTheMonth(gameId);
            setGames(prev => prev.map(g => ({
                ...g,
                isGameOfMonth: g.id === gameId
            })));
            showToast('success', 'Đã đặt làm Game của Tháng!');
        } catch (err: any) { showToast('error', err.message); }
        finally { setTogglingGameOfMonth(null); }
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

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') params.set(key, value);
        else params.delete(key);
        if (key !== 'page') params.delete('page'); // Reset page only on filter change, not on page navigation
        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('?');
    };

    const handleSearchInput = (value: string) => {
        updateFilter('q', value);
    };

    return (
        <div className="space-y-5">
            {/* Header & Filters Card */}
            <div className="rounded-[10px] border shadow-sm" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="p-4 space-y-4">
                    {/* Top Row: Search & Actions */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="relative w-full xl:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#637381]" />
                            <input
                                type="text"
                                defaultValue={search}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    debounce(() => handleSearchInput(val), 500)();
                                }}
                                placeholder="Tìm kiếm game..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-md text-white text-sm border focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors"
                                style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[#A5B4CB] text-sm border hover:text-white hover:bg-[#2E3A47] transition-all cursor-pointer" style={{ borderColor: '#2E3A47' }} title="Xuất CSV">
                                <Download className="w-4 h-4" /> <span className="hidden sm:inline">CSV</span>
                            </button>
                            <button onClick={handleReseed} disabled={reseeding} className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm border hover:text-white hover:bg-[#2E3A47] transition-all cursor-pointer disabled:opacity-50" style={{ borderColor: '#2E3A47', color: reseeding ? '#637381' : '#A5B4CB' }}>
                                {reseeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                <span className="hidden sm:inline">{reseeding ? 'Đang sync...' : 'Sync DB'}</span>
                            </button>
                            <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-semibold hover:brightness-110 shadow-lg transition-all active:scale-[0.98] cursor-pointer" style={{ background: 'linear-gradient(135deg, #3C50E0 0%, #6577F3 100%)' }}>
                                <Plus className="w-4 h-4" /> Thêm game mới
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full" style={{ background: '#2E3A47' }} />

                    {/* Bottom Row: Advanced Filters */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="flex items-center gap-2 text-[#637381] mr-1">
                            <FolderOpen className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Bộ lọc:</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap items-center gap-2 flex-1">
                            <div className="relative flex-1 min-w-[140px]">
                                <select
                                    value={systemFilter}
                                    onChange={e => updateFilter('system', e.target.value)}
                                    className="w-full px-3 py-2 rounded-md text-white text-xs border focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors appearance-none cursor-pointer"
                                    style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                                >
                                    <option value="all">Mọi hệ máy</option>
                                    {SYSTEMS.map(sys => <option key={sys.id} value={sys.id}>{sys.name}</option>)}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#637381]">
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            <div className="relative flex-1 min-w-[140px]">
                                <select
                                    value={categoryFilter}
                                    onChange={e => updateFilter('category', e.target.value)}
                                    className="w-full px-3 py-2 rounded-md text-white text-xs border focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors appearance-none cursor-pointer"
                                    style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                                >
                                    <option value="all">Mọi danh mục</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.displayName}</option>)}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#637381]">
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            <div className="relative flex-1 min-w-[140px]">
                                <select
                                    value={regionFilter}
                                    onChange={e => updateFilter('region', e.target.value)}
                                    className="w-full px-3 py-2 rounded-md text-white text-xs border focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors appearance-none cursor-pointer"
                                    style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                                >
                                    <option value="all">Mọi khu vực</option>
                                    {REGIONS.filter(r => r).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#637381]">
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            <div className="relative flex-1 min-w-[140px]">
                                <select
                                    value={featuredFilter}
                                    onChange={e => updateFilter('featured', e.target.value)}
                                    className="w-full px-3 py-2 rounded-md text-white text-xs border focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors appearance-none cursor-pointer"
                                    style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                                >
                                    <option value="all">Mọi trạng thái</option>
                                    <option value="yes">⭐ Nổi bật</option>
                                    <option value="no">Bình thường</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#637381]">
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            {(search || systemFilter !== 'all' || categoryFilter !== 'all' || regionFilter !== 'all' || featuredFilter !== 'all') && (
                                <button 
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-md text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer text-xs font-semibold"
                                    title="Xóa tất cả bộ lọc"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Làm mới</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-[10px] overflow-hidden border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2E3A47' }}>
                                <th className="text-left px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Tên game</th>
                                <th className="text-left px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Danh mục</th>
                                <th className="text-left px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Hệ máy</th>
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
                                    <td className="px-5 py-3.5 text-left text-[#A5B4CB] text-sm font-semibold uppercase">{game.system || 'NES'}</td>
                                    <td className="px-5 py-3.5 text-center text-sm font-mono" style={{ color: '#3C50E0' }}>{(game.playCount || 0).toLocaleString()}</td>
                                    <td className="px-5 py-3.5 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <ActionButton
                                                icon={togglingFeatured === game.id ? Loader2 : Star}
                                                label={game.isFeatured ? 'Bỏ nổi bật' : 'Nổi bật'}
                                                onClick={() => handleToggleFeatured(game.id)}
                                                variant="warning"
                                                disabled={togglingFeatured === game.id}
                                                active={game.isFeatured}
                                            />
                                            {game.isGameOfMonth && (
                                                <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-md font-semibold border border-[#10B981]/20">
                                                    Game của Tháng
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1 flex-wrap">
                                            {!game.isGameOfMonth && (
                                                <ActionButton
                                                    icon={togglingGameOfMonth === game.id ? Loader2 : Wand2}
                                                    label="Game Tháng"
                                                    onClick={() => handleToggleGameOfMonth(game.id)}
                                                    variant="default"
                                                    disabled={togglingGameOfMonth === game.id}
                                                />
                                            )}
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
                            <button onClick={() => updateFilter('page', String(Math.max(0, page - 1)))} disabled={page === 0} className="p-1.5 rounded-md text-[#A5B4CB] hover:text-white hover:bg-[#333A48] disabled:opacity-30 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="px-3 py-1 text-white text-xs font-medium">{page + 1} / {totalPages}</span>
                            <button onClick={() => updateFilter('page', String(Math.min(totalPages - 1, page + 1)))} disabled={page >= totalPages - 1} className="p-1.5 rounded-md text-[#A5B4CB] hover:text-white hover:bg-[#333A48] disabled:opacity-30 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
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

                            <GameGeneralInfoForm
                                form={form}
                                setForm={setForm}
                                autoFillFromName={autoFillFromName}
                                onRomUploaded={onRomUploaded}
                                categories={categories}
                                isEditing={!!editingGame}
                            />

                            <GameMediaForm
                                form={form}
                                setForm={setForm}
                                applyImageBaseUrl={applyImageBaseUrl}
                                applyRAWGImages={applyRAWGImages}
                            />

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
