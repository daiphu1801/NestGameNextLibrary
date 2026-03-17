'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { Clock, ChevronLeft, ChevronRight, Filter, Gamepad2, Users, FolderTree, MessageSquare, Star, Settings } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';

const actionColors: Record<string, { bg: string; text: string }> = {
    CREATE: { bg: '#10B98120', text: '#10B981' },
    UPDATE: { bg: '#3C50E020', text: '#3C50E0' },
    DELETE: { bg: '#FB545420', text: '#FB5454' },
    TOGGLE: { bg: '#F59E0B20', text: '#F59E0B' },
    LOGIN: { bg: '#8B5CF620', text: '#8B5CF6' },
};

const typeIcons: Record<string, any> = {
    GAME: Gamepad2,
    USER: Users,
    CATEGORY: FolderTree,
    COMMENT: MessageSquare,
    RATING: Star,
    SETTINGS: Settings,
};

function ActivityContent() {
    const [logs, setLogs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const { showToast } = useToast();
    const SIZE = 20;

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getActivityLogs(page, SIZE, filter || undefined);
            setLogs(data.content || []);
            setTotal(data.totalElements || 0);
        } catch (err: any) { showToast('error', err.message); }
        finally { setLoading(false); }
    }, [page, filter, showToast]);

    useEffect(() => { loadLogs(); }, [loadLogs]);

    const totalPages = Math.ceil(total / SIZE);
    const filters = ['', 'GAME', 'USER', 'CATEGORY', 'COMMENT', 'RATING', 'SETTINGS'];
    const filterLabels: Record<string, string> = { '': 'Tất cả', GAME: 'Game', USER: 'User', CATEGORY: 'Danh mục', COMMENT: 'Bình luận', RATING: 'Đánh giá', SETTINGS: 'Cài đặt' };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Lịch sử hoạt động</h1>
                    <p className="text-[#8A99AF] text-sm mt-1">Theo dõi mọi thao tác quản trị</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#A5B4CB]">
                    <Filter className="w-4 h-4" />
                    <span>Tổng: {total}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                    <button key={f} onClick={() => { setFilter(f); setPage(0); }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${filter === f ? 'text-white' : 'text-[#8A99AF] hover:text-white'}`}
                        style={{ background: filter === f ? '#3C50E0' : '#1C2434', border: `1px solid ${filter === f ? '#3C50E0' : '#2E3A47'}` }}
                    >
                        {filterLabels[f]}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="rounded-[10px] border overflow-hidden" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-[#636B7F]">
                        <Clock className="w-10 h-10 mb-2" />
                        <p className="text-sm">Chưa có hoạt động nào</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: '#2E3A47' }}>
                        {logs.map((log: any, i: number) => {
                            const color = actionColors[log.action] || { bg: '#33394820', text: '#8A99AF' };
                            const Icon = typeIcons[log.targetType] || Clock;
                            return (
                                <div key={log.id || i} className="flex items-start gap-4 p-4 hover:bg-[#1C2434]/50 transition-colors">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: color.bg }}>
                                        <Icon className="w-4 h-4" style={{ color: color.text }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{ background: color.bg, color: color.text }}>
                                                {log.action}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded border text-[#A5B4CB]" style={{ borderColor: '#2E3A47', background: '#1C2434' }}>
                                                {log.targetType}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#DEE4EE] mt-1">{log.details}</p>
                                        {log.targetName && <p className="text-xs text-[#636B7F] mt-0.5">Mục tiêu: {log.targetName}</p>}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-[#636B7F]">
                                            {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—'}
                                        </p>
                                        <p className="text-xs text-[#4B5563] mt-0.5">{log.adminUsername}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
        </div>
    );
}

export default function ActivityPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" /></div>}>
            <ActivityContent />
        </Suspense>
    );
}
