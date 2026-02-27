'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Crown, Loader2, StarOff, Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';

export default function FeaturedGamesPage() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const SIZE = 12; // Grid layout prefers mutiples of 3 or 4

    const loadGames = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getFeaturedGames(page, SIZE);
            setGames(data.content);
            setTotal(data.totalElements);
        } catch (err: any) {
            showToast('error', err.message || 'Lỗi khi tải game nổi bật');
        } finally {
            setLoading(false);
        }
    }, [page, showToast]);

    useEffect(() => { loadGames(); }, [loadGames]);

    const handleRemoveFeatured = async (game: any) => {
        if (!confirm(`Bạn có chắc muốn bỏ nổi bật game "${game.name}"?`)) return;
        setProcessingId(game.id);
        try {
            await adminService.toggleFeatured(game.id);
            setGames(prev => prev.filter(g => g.id !== game.id));
            setTotal(t => t - 1);
            showToast('success', `Đã bỏ nổi bật game ${game.name}`);
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const totalPages = Math.ceil(total / SIZE);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Crown className="w-8 h-8 text-[#F59E0B]" />
                        Game Nổi Bật
                    </h1>
                    <p className="text-[#A5B4CB] text-sm mt-1">Quản lý danh sách các game được đánh dấu hiển thị đặc biệt trên trang chủ.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#3C50E0]" />
                </div>
            ) : games.length === 0 ? (
                <div className="rounded-[10px] p-12 flex flex-col items-center justify-center text-center" style={{ background: '#24303F', border: '1px dashed #2E3A47' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Crown className="w-8 h-8 text-[#F59E0B]" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">Chưa có game nổi bật nào</h3>
                    <p className="text-[#A5B4CB] text-sm max-w-sm">Hãy vào trang Quản lý Games và chọn những tựa game hấp dẫn nhất để đánh dấu nổi bật nhé.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {games.map(game => (
                            <div key={game.id} className="group rounded-[12px] overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                                {/* Image container */}
                                <div className="aspect-[4/3] w-full relative bg-[#1C2434] overflow-hidden border-b" style={{ borderColor: '#2E3A47' }}>
                                    {game.imageUrl ? (
                                        <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#637381]">
                                            <Gamepad2 className="w-10 h-10" />
                                            <span className="text-xs font-medium">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] items-center gap-1 font-bold shadow bg-white/10 backdrop-blur-md text-[#F59E0B] border border-[#F59E0B]/30 flex">
                                            <Crown className="w-3 h-3 fill-current" />
                                            Nổi Bật
                                        </span>
                                    </div>

                                    {/* Overlay actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button
                                            onClick={() => handleRemoveFeatured(game)}
                                            disabled={processingId === game.id}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center gap-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {processingId === game.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <StarOff className="w-4 h-4" />}
                                            Bỏ nổi bật
                                        </button>
                                    </div>
                                </div>

                                {/* Content info */}
                                <div className="p-4">
                                    <h3 className="text-white font-bold text-base truncate mb-1" title={game.name}>{game.name}</h3>
                                    <p className="text-[#A5B4CB] text-xs mb-3 flex items-center gap-2">
                                        <span>{game.categoryName || 'Không danh mục'}</span>
                                        <span className="w-1 h-1 rounded-full bg-[#A5B4CB]"></span>
                                        <span className="font-mono text-[#3C50E0]">{(game.playCount || 0).toLocaleString()} lượt chơi</span>
                                    </p>
                                </div>
                                <div className="h-1 w-full bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#EC4899] opacity-70"></div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center mt-8 gap-2">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#24303F] border border-[#2E3A47] text-[#A5B4CB] hover:text-white hover:bg-[#333A48] disabled:opacity-40 transition-colors cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
                            <div className="px-4 py-2 rounded-lg bg-[#24303F] border border-[#2E3A47] text-white text-sm font-medium">Trang {page + 1} / {totalPages}</div>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#24303F] border border-[#2E3A47] text-[#A5B4CB] hover:text-white hover:bg-[#333A48] disabled:opacity-40 transition-colors cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
