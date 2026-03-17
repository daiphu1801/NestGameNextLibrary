'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Download, X, Eye, Gamepad2, MessageSquare, Heart, Clock } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ActionButton } from '../components/ActionButton';

function AdminUsersContent() {
    const [users, setUsers] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const search = searchParams.get('q') || '';
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [detailUser, setDetailUser] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const { showToast } = useToast();
    const SIZE = 15;

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getUsers(page, SIZE, search || undefined);
            setUsers(data.content);
            setTotal(data.totalElements);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { setPage(0); }, [search]);



    const handleRoleChange = async (userId: number, newRole: string) => {
        try { await adminService.updateUserRole(userId, newRole); loadUsers(); showToast('success', 'Cập nhật role thành công!'); }
        catch (err: any) { showToast('error', err.message); }
    };

    const handleStatusToggle = async (userId: number, currentActive: boolean) => {
        try { await adminService.updateUserStatus(userId, !currentActive); loadUsers(); showToast('success', 'Cập nhật trạng thái thành công!'); }
        catch (err: any) { showToast('error', err.message); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try { await adminService.deleteUser(deleteTarget.id); setDeleteTarget(null); loadUsers(); showToast('success', 'Đã xóa người dùng thành công!'); }
        catch (err: any) { showToast('error', err.message); }
    };

    const openDetail = async (userId: number) => {
        setDetailLoading(true);
        setDetailUser(null);
        try {
            const detail = await adminService.getUserDetail(userId);
            setDetailUser(detail);
        } catch (err: any) { showToast('error', err.message); }
        finally { setDetailLoading(false); }
    };

    const exportCSV = () => {
        const headers = ['ID', 'Username', 'Email', 'Role', 'Status', 'Created At'];
        const rows = users.map(u => [u.id, u.username, u.email, u.role, u.active ? 'Active' : 'Inactive', u.createdAt || '']);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const totalPages = Math.ceil(total / SIZE);

    return (
        <div className="space-y-5">
            {/* Actions */}
            <div className="flex items-center justify-end">
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[#A5B4CB] text-sm border hover:text-white transition-all cursor-pointer" style={{ borderColor: '#2E3A47', background: '#24303F' }}>
                    <Download className="w-4 h-4" /> Xuất CSV
                </button>
            </div>

            {/* Table */}
            <div className="rounded-[10px] overflow-hidden border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2E3A47' }}>
                                <th className="text-left px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Người dùng</th>
                                <th className="text-left px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Email</th>
                                <th className="text-center px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Role</th>
                                <th className="text-center px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Trạng thái</th>
                                <th className="text-right px-5 py-4 text-xs font-medium text-[#A5B4CB] uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10"><div className="w-6 h-6 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 text-[#637381] text-sm">Không tìm thấy người dùng</td></tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="transition-colors hover:bg-[#2E3A47]/50" style={{ borderBottom: '1px solid #2E3A47' }}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#3C50E0' }}>
                                                {user.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span className="text-white text-sm font-medium">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-[#A5B4CB] text-sm">{user.email}</td>
                                    <td className="px-5 py-3.5 text-center">
                                        <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className={`px-3 py-1 rounded text-xs font-medium border-0 cursor-pointer focus:outline-none ${user.role === 'ADMIN' ? 'text-[#8B5CF6]' : 'text-[#3C50E0]'}`}
                                            style={{ background: user.role === 'ADMIN' ? 'rgba(139,92,246,0.1)' : 'rgba(60,80,224,0.1)' }}>
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <button
                                            onClick={() => handleStatusToggle(user.id, user.active)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${user.active ? 'text-[#10B981]' : 'text-[#FB5454]'}`}
                                            style={{ background: user.active ? 'rgba(16,185,129,0.1)' : 'rgba(251,84,84,0.1)' }}
                                        >
                                            {user.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                            {user.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <ActionButton icon={Eye} label="Chi tiết" onClick={() => openDetail(user.id)} variant="primary" />
                                            <ActionButton icon={Trash2} label="Xóa" onClick={() => setDeleteTarget(user)} variant="danger" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

            {/* User Detail Drawer */}
            {(detailUser || detailLoading) && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/50" onClick={() => { setDetailUser(null); setDetailLoading(false); }} />
                    <div className="relative w-full max-w-md h-full overflow-y-auto border-l animate-in slide-in-from-right duration-300"
                        style={{ background: '#1C2434', borderColor: '#2E3A47' }}>
                        <div className="sticky top-0 z-10 flex items-center justify-between p-5" style={{ background: '#1C2434', borderBottom: '1px solid #2E3A47' }}>
                            <h3 className="text-white font-semibold">Chi tiết người dùng</h3>
                            <button onClick={() => { setDetailUser(null); setDetailLoading(false); }} className="p-1.5 rounded-md hover:bg-[#333A48] text-[#A5B4CB] hover:text-white transition-colors cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-6 h-6 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : detailUser && (
                            <div className="p-5 space-y-5">
                                {/* Profile */}
                                <div className="text-center space-y-3">
                                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold" style={{ background: '#3C50E0' }}>
                                        {detailUser.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">{detailUser.username}</h4>
                                        <p className="text-[#A5B4CB] text-sm">{detailUser.email}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${detailUser.role === 'ADMIN' ? 'text-[#8B5CF6]' : 'text-[#3C50E0]'}`} style={{ background: detailUser.role === 'ADMIN' ? 'rgba(139,92,246,0.1)' : 'rgba(60,80,224,0.1)' }}>{detailUser.role}</span>
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${detailUser.active ? 'text-[#10B981]' : 'text-[#FB5454]'}`} style={{ background: detailUser.active ? 'rgba(16,185,129,0.1)' : 'rgba(251,84,84,0.1)' }}>{detailUser.active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    {detailUser.bio && <p className="text-[#A5B4CB] text-sm italic">{detailUser.bio}</p>}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { icon: Gamepad2, label: 'Lượt chơi', value: detailUser.totalPlays, color: '#3C50E0' },
                                        { icon: MessageSquare, label: 'Bình luận', value: detailUser.totalComments, color: '#0FADCF' },
                                        { icon: Heart, label: 'Yêu thích', value: detailUser.totalFavorites, color: '#FB5454' },
                                    ].map(({ icon: Icon, label, value, color }) => (
                                        <div key={label} className="rounded-[10px] p-3 text-center border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                                            <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
                                            <p className="text-white font-bold text-lg">{value || 0}</p>
                                            <p className="text-[#637381] text-[10px] uppercase tracking-wider">{label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Play History */}
                                <div>
                                    <h5 className="text-[#A5B4CB] text-xs uppercase tracking-wider font-semibold mb-3">Lịch sử chơi gần đây</h5>
                                    {detailUser.recentPlays?.length > 0 ? (
                                        <div className="space-y-2">
                                            {detailUser.recentPlays.map((play: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-[10px] border hover:bg-[#2E3A47]/50 transition-colors" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                                                    {play.gameImageUrl ? (
                                                        <img src={play.gameImageUrl} alt="" className="w-8 h-8 rounded-md object-cover" style={{ border: '1px solid #2E3A47' }} />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-[#637381]" style={{ background: '#1C2434' }}>
                                                            <Gamepad2 className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">{play.gameName}</p>
                                                        <p className="text-[#637381] text-xs flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDuration(play.durationSeconds)}
                                                        </p>
                                                    </div>
                                                    <span className="text-[#637381] text-xs whitespace-nowrap">
                                                        {play.playedAt ? new Date(play.playedAt).toLocaleDateString('vi-VN') : ''}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[#637381] text-sm text-center py-4">Chưa có lịch sử chơi</p>
                                    )}
                                </div>

                                {/* Joined Date */}
                                <div className="pt-3 text-center" style={{ borderTop: '1px solid #2E3A47' }}>
                                    <p className="text-[#637381] text-xs">
                                        Tham gia: {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Xóa người dùng"
                message={`Bạn có chắc chắn muốn xóa người dùng "${deleteTarget?.username}"? Toàn bộ dữ liệu liên quan sẽ bị mất.`}
                confirmLabel="Xóa"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminUsersContent />
        </Suspense>
    );
}
