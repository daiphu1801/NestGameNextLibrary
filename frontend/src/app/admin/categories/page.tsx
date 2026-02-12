'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, FolderTree } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ActionButton } from '../components/ActionButton';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [form, setForm] = useState({ name: '', displayName: '', icon: '' });

    const loadCategories = async () => {
        setLoading(true);
        try { const data = await adminService.getCategories(); setCategories(data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadCategories(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', displayName: '', icon: '' });
        setModalOpen(true);
    };

    const openEdit = (cat: any) => {
        setEditing(cat);
        setForm({ name: cat.name || '', displayName: cat.displayName || '', icon: cat.icon || '' });
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) { await adminService.updateCategory(editing.id, form); }
            else { await adminService.createCategory(form); }
            setModalOpen(false);
            loadCategories();
        } catch (err: any) { alert(err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try { await adminService.deleteCategory(deleteTarget.id); setDeleteTarget(null); loadCategories(); }
        catch (err: any) { alert(err.message); }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-[#A5B4CB] text-sm">{categories.length} danh mục</p>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer"
                    style={{ background: '#3C50E0' }}
                >
                    <Plus className="w-4 h-4" />
                    Thêm danh mục
                </button>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : categories.length === 0 ? (
                <div className="rounded-[10px] p-10 text-center border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                    <FolderTree className="w-12 h-12 mx-auto mb-3" style={{ color: '#2E3A47' }} />
                    <p className="text-[#637381] text-sm">Chưa có danh mục nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="rounded-[10px] p-5 group hover:border-[#3C50E0]/30 transition-all duration-300 border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'rgba(60,80,224,0.1)' }}>
                                    {cat.icon || '🎮'}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ActionButton icon={Pencil} label="Sửa" onClick={() => openEdit(cat)} variant="primary" />
                                    <ActionButton icon={Trash2} label="Xóa" onClick={() => setDeleteTarget(cat)} variant="danger" />
                                </div>
                            </div>
                            <h4 className="text-white font-semibold text-sm mb-0.5">{cat.displayName}</h4>
                            <p className="text-[#637381] text-xs font-mono">{cat.name}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="rounded-[10px] w-full max-w-md border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #2E3A47' }}>
                            <h3 className="text-white font-semibold">{editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#A5B4CB] hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {[
                                { label: 'Tên (slug) *', key: 'name', placeholder: 'vd: nes, snes, gba', required: true },
                                { label: 'Tên hiển thị *', key: 'displayName', placeholder: 'vd: Nintendo Entertainment System', required: true },
                                { label: 'Icon (emoji)', key: 'icon', placeholder: '🎮', required: false },
                            ].map(({ label, key, placeholder, required }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider">{label}</label>
                                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={required} placeholder={placeholder}
                                        className="w-full px-3 py-2.5 rounded-md text-white text-sm placeholder:text-[#637381] focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors border"
                                        style={{ background: '#1C2434', borderColor: '#2E3A47' }} />
                                </div>
                            ))}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-md text-[#A5B4CB] text-sm font-medium hover:text-white border transition-colors cursor-pointer" style={{ borderColor: '#2E3A47' }}>Hủy</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer" style={{ background: '#3C50E0' }}>
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editing ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Xóa danh mục"
                message={`Bạn có chắc chắn muốn xóa danh mục "${deleteTarget?.displayName}"? Các game thuộc danh mục này sẽ không còn danh mục.`}
                confirmLabel="Xóa"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
