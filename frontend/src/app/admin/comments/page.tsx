'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trash2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ActionButton } from '../components/ActionButton';

function AdminCommentsContent() {
    const [comments, setComments] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const search = searchParams.get('q') || '';
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const { showToast } = useToast();
    const SIZE = 20;

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getComments(page, SIZE, search || undefined);
            setComments(data.content);
            setTotal(data.totalElements);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { loadComments(); }, [loadComments]);
    useEffect(() => { setPage(0); }, [search]);



    const handleDelete = async () => {
        if (!deleteTarget) return;
        try { await adminService.deleteComment(deleteTarget.id); setDeleteTarget(null); loadComments(); showToast('success', 'Đã xóa bình luận thành công!'); }
        catch (err: any) { showToast('error', err.message); }
    };

    const totalPages = Math.ceil(total / SIZE);

    return (
        <div className="space-y-5">

            {/* Comments List */}
            <div className="rounded-[10px] overflow-hidden border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-[#637381]">
                        <MessageSquare className="w-10 h-10 mb-3 opacity-50" />
                        <p className="text-sm">Không tìm thấy bình luận</p>
                    </div>
                ) : (
                    <div>
                        {comments.map((comment, idx) => (
                            <div key={comment.id} className="flex items-start gap-4 p-5 hover:bg-[#2E3A47]/50 transition-colors group" style={{ borderBottom: idx < comments.length - 1 ? '1px solid #2E3A47' : 'none' }}>
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#3C50E0' }}>
                                    {comment.username?.[0]?.toUpperCase() || '?'}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white text-sm font-medium">{comment.username}</span>
                                        <span className="text-[#637381] text-xs">•</span>
                                        <span className="text-xs font-medium" style={{ color: '#3C50E0' }}>{comment.gameName}</span>
                                    </div>
                                    <p className="text-[#A5B4CB] text-sm leading-relaxed break-words">{comment.content}</p>
                                    <p className="text-[#637381] text-xs mt-1.5">
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString('vi-VN') : ''}
                                    </p>
                                </div>

                                {/* Delete */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <ActionButton icon={Trash2} label="Xóa" onClick={() => setDeleteTarget(comment)} variant="danger" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Xóa bình luận"
                message={`Xóa bình luận của "${deleteTarget?.username}" trong game "${deleteTarget?.gameName}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

export default function AdminCommentsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminCommentsContent />
        </Suspense>
    );
}
