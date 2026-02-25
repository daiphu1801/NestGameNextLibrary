'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Star, ChevronLeft, ChevronRight, Loader2, Download } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ActionButton } from '../components/ActionButton';

export default function AdminGamesPage() {
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

    const [form, setForm] = useState({
        name: '', fileName: '', path: '', categoryId: '' as any,
        description: '', rating: '', year: '', region: '',
        isFeatured: false, imageUrl: '', imageSnap: '', imageTitle: ''
    });

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

    const openCreate = () => {
        setEditingGame(null);
        setForm({ name: '', fileName: '', path: '', categoryId: '', description: '', rating: '', year: '', region: '', isFeatured: false, imageUrl: '', imageSnap: '', imageTitle: '' });
        setModalOpen(true);
    };

    const openEdit = (game: any) => {
        setEditingGame(game);
        setForm({
            name: game.name || '', fileName: game.fileName || '', path: game.path || '',
            categoryId: game.categoryId || '', description: game.description || '',
            rating: game.rating || '', year: game.year || '', region: game.region || '',
            isFeatured: game.isFeatured || false, imageUrl: game.imageUrl || '',
            imageSnap: game.imageSnap || '', imageTitle: game.imageTitle || ''
        });
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, categoryId: form.categoryId ? Number(form.categoryId) : null, rating: form.rating ? Number(form.rating) : null, year: form.year ? Number(form.year) : null };
            if (editingGame) { await adminService.updateGame(editingGame.id, payload); showToast('success', 'Cập nhật game thành công!'); }
            else { await adminService.createGame(payload); showToast('success', 'Tạo game mới thành công!'); }
            setModalOpen(false);
            loadGames();
        } catch (err: any) { showToast('error', err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try { await adminService.deleteGame(deleteTarget.id); setDeleteTarget(null); loadGames(); showToast('success', 'Đã xóa game thành công!'); }
        catch (err: any) { showToast('error', err.message); }
    };

    const handleToggleFeatured = async (gameId: number) => {
        setTogglingFeatured(gameId);
        try {
            await adminService.toggleFeatured(gameId);
            setGames(prev => prev.map(g => g.id === gameId ? { ...g, isFeatured: !g.isFeatured } : g));
        } catch (err: any) { showToast('error', err.message); }
        finally { setTogglingFeatured(null); }
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

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-end gap-2">
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[#A5B4CB] text-sm border hover:text-white transition-all cursor-pointer" style={{ borderColor: '#2E3A47', background: '#24303F' }} title="Xuất CSV">
                    <Download className="w-4 h-4" /> CSV
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
                        <span className="text-[#637381] text-xs">{page * SIZE + 1}–{Math.min((page + 1) * SIZE, total)} / {total}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-md text-[#A5B4CB] hover:text-white hover:bg-[#333A48] disabled:opacity-30 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="px-3 py-1 text-white text-xs font-medium">{page + 1} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-md text-[#A5B4CB] hover:text-white hover:bg-[#333A48] disabled:opacity-30 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-y-auto border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #2E3A47' }}>
                            <h3 className="text-white font-semibold text-lg">{editingGame ? 'Chỉnh sửa game' : 'Thêm game mới'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#A5B4CB] hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Tên game *', key: 'name', required: true },
                                    { label: 'File Name *', key: 'fileName', required: true },
                                    { label: 'Path *', key: 'path', required: true },
                                ].map(({ label, key, required }) => (
                                    <div key={key}>
                                        <label className="block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider">{label}</label>
                                        <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={required}
                                            className="w-full px-3 py-2.5 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors border"
                                            style={{ background: '#1C2434', borderColor: '#2E3A47' }} />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider">Danh mục</label>
                                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors border"
                                        style={{ background: '#1C2434', borderColor: '#2E3A47' }}>
                                        <option value="">— Chọn —</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                                    </select>
                                </div>
                                {[
                                    { label: 'Region', key: 'region' },
                                    { label: 'Năm', key: 'year', type: 'number' },
                                    { label: 'Rating', key: 'rating', type: 'number', step: '0.1' },
                                ].map(({ label, key, type, step }) => (
                                    <div key={key}>
                                        <label className="block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider">{label}</label>
                                        <input type={type || 'text'} step={step} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors border"
                                            style={{ background: '#1C2434', borderColor: '#2E3A47' }} />
                                    </div>
                                ))}
                                <div className="flex items-center gap-3 pt-7">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 rounded accent-[#3C50E0]" />
                                        <span className="text-white text-sm">Featured</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider">Mô tả</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                                    className="w-full px-3 py-2.5 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors resize-none border"
                                    style={{ background: '#1C2434', borderColor: '#2E3A47' }} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {['imageUrl', 'imageSnap', 'imageTitle'].map(key => (
                                    <div key={key}>
                                        <label className="block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</label>
                                        <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors border"
                                            style={{ background: '#1C2434', borderColor: '#2E3A47' }} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-md text-[#A5B4CB] text-sm font-medium hover:text-white border transition-colors cursor-pointer" style={{ borderColor: '#2E3A47' }}>Hủy</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer" style={{ background: '#3C50E0' }}>
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingGame ? 'Cập nhật' : 'Tạo'}
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
                message={`Bạn có chắc chắn muốn xóa game "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
