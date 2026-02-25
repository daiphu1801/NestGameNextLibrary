'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ActionButton } from '../components/ActionButton';

export default function RatingsPage() {
    const searchParams = useSearchParams();
    const [ratings, setRatings] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const { showToast } = useToast();
    const SIZE = 20;

    const loadRatings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getRatings(page, SIZE, search || undefined);
            setRatings(data.content || []);
            setTotal(data.totalElements || 0);
        } catch (err: any) { showToast('error', err.message); }
        finally { setLoading(false); }
    }, [page, search, showToast]);

    useEffect(() => { loadRatings(); }, [loadRatings]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try { await adminService.deleteRating(deleteTarget.id); setDeleteTarget(null); loadRatings(); showToast('success', 'Đã xóa đánh giá thành công!'); }
        catch (err: any) { showToast('error', err.message); }
    };

    const totalPages = Math.ceil(total / SIZE);

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-3.5 h-3.5" style={{ color: s <= rating ? '#F59E0B' : '#333A48' }} fill={s <= rating ? '#F59E0B' : 'none'} />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản lý đánh giá</h1>
                    <p className="text-[#8A99AF] text-sm mt-1">Xem và quản lý đánh giá game từ người dùng</p>
                </div>
                <span className="text-sm text-[#A5B4CB] font-medium">Tổng: {total}</span>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636B7F]" />
                <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Tìm theo user hoặc tên game..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-white text-sm placeholder-[#636B7F] focus:outline-none focus:border-[#3C50E0] transition-colors"
                    style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                />
            </div>

            {/* Table */}
            <div className="rounded-[10px] border overflow-hidden" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : ratings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-[#636B7F]">
                        <Star className="w-10 h-10 mb-2" />
                        <p className="text-sm">Chưa có đánh giá nào</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-left text-xs text-[#8A99AF] uppercase tracking-wider" style={{ borderColor: '#2E3A47' }}>
                                <th className="px-4 py-3 font-medium">Người dùng</th>
                                <th className="px-4 py-3 font-medium">Game</th>
                                <th className="px-4 py-3 font-medium">Đánh giá</th>
                                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: '#2E3A47' }}>
                            {ratings.map((r: any) => (
                                <tr key={r.id} className="hover:bg-[#1C2434]/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {r.avatarUrl ? (
                                                <img src={r.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#3C50E0]" style={{ background: '#3C50E020' }}>
                                                    {r.username?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <span className="text-sm text-[#DEE4EE]">{r.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#A5B4CB]">{r.gameName}</td>
                                    <td className="px-4 py-3">{renderStars(r.rating)}</td>
                                    <td className="px-4 py-3 text-xs text-[#636B7F]">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <ActionButton icon={Trash2} label="Xóa" variant="danger" onClick={() => setDeleteTarget(r)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8A99AF]">Trang {page + 1} / {totalPages}</span>
                    <div className="flex gap-2">
                        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="p-2 rounded border text-[#8A99AF] hover:text-white disabled:opacity-30 cursor-pointer" style={{ borderColor: '#2E3A47', background: '#24303F' }}>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="p-2 rounded border text-[#8A99AF] hover:text-white disabled:opacity-30 cursor-pointer" style={{ borderColor: '#2E3A47', background: '#24303F' }}>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Xóa đánh giá"
                message={`Bạn chắc chắn muốn xóa đánh giá của "${deleteTarget?.username}" cho game "${deleteTarget?.gameName}"?`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </div>
    );
}
