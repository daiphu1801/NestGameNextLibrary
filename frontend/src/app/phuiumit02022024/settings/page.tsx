'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useToast } from '../components/ToastProvider';

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({ username: '', email: '', bio: '', avatarUrl: '' });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
    const [changingPw, setChangingPw] = useState(false);
    const { showToast } = useToast();

    const loadProfile = useCallback(async () => {
        try {
            const admin = adminService.getCurrentAdmin();
            if (!admin) return;
            const data = await adminService.getProfile(admin.username);
            setProfile(data);
            setForm({ username: data.username || '', email: data.email || '', bio: '', avatarUrl: data.avatarUrl || '' });
        } catch (err: any) { showToast('error', err.message); }
        finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const admin = adminService.getCurrentAdmin();
            const result = await adminService.updateProfile({ currentUsername: admin?.username, ...form });
            // Update local storage
            // Only store non-sensitive fields
            if (admin) {
                localStorage.setItem('admin_user', JSON.stringify({ username: result.username, avatarUrl: result.avatarUrl }));
            }
            showToast('success', 'Cập nhật profile thành công!');
            loadProfile();
        } catch (err: any) { showToast('error', err.message); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            showToast('warning', 'Mật khẩu mới không khớp!');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            showToast('warning', 'Mật khẩu mới phải ít nhất 6 ký tự!');
            return;
        }
        setChangingPw(true);
        try {
            const admin = adminService.getCurrentAdmin();
            await adminService.changePassword({
                username: admin?.username || '',
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            showToast('success', 'Đổi mật khẩu thành công!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) { showToast('error', err.message); }
        finally { setChangingPw(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const inputClass = "w-full px-4 py-3 rounded-lg border text-white text-sm placeholder-[#636B7F] focus:outline-none focus:border-[#3C50E0] transition-colors";
    const inputStyle = { background: '#1C2434', borderColor: '#2E3A47' };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
                <p className="text-[#8A99AF] text-sm mt-1">Quản lý thông tin cá nhân và bảo mật</p>
            </div>

            {/* Profile Section */}
            <form onSubmit={handleSaveProfile} className="rounded-[10px] border p-6 space-y-5" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: '#2E3A47' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#3C50E020' }}>
                        <User className="w-5 h-5" style={{ color: '#3C50E0' }} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Thông tin Profile</h2>
                        <p className="text-xs text-[#8A99AF]">Chỉnh sửa thông tin hiển thị của bạn</p>
                    </div>
                </div>

                {/* Avatar preview */}
                {form.avatarUrl && (
                    <div className="flex items-center gap-4">
                        <img src={form.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: '#3C50E0' }} />
                        <p className="text-[#8A99AF] text-sm">Ảnh đại diện hiện tại</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-[#A5B4CB] mb-1.5 block">Username</label>
                        <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className={inputClass} style={inputStyle} placeholder="Username" />
                    </div>
                    <div>
                        <label className="text-sm text-[#A5B4CB] mb-1.5 block">Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} style={inputStyle} placeholder="Email" />
                    </div>
                </div>

                <div>
                    <label className="text-sm text-[#A5B4CB] mb-1.5 block">Avatar URL</label>
                    <input type="url" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} className={inputClass} style={inputStyle} placeholder="https://..." />
                </div>

                <div>
                    <label className="text-sm text-[#A5B4CB] mb-1.5 block">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className={`${inputClass} resize-none min-h-[80px]`} style={inputStyle} placeholder="Viết gì đó về bản thân..." />
                </div>

                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-medium disabled:opacity-50 hover:brightness-110 transition-all cursor-pointer" style={{ background: '#3C50E0' }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </form>

            {/* Password Section */}
            <form onSubmit={handleChangePassword} className="rounded-[10px] border p-6 space-y-5" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: '#2E3A47' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#F59E0B20' }}>
                        <Lock className="w-5 h-5" style={{ color: '#F59E0B' }} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Đổi mật khẩu</h2>
                        <p className="text-xs text-[#8A99AF]">Cập nhật mật khẩu đăng nhập của bạn</p>
                    </div>
                </div>

                {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field, i) => (
                    <div key={field}>
                        <label className="text-sm text-[#A5B4CB] mb-1.5 block">
                            {field === 'currentPassword' ? 'Mật khẩu hiện tại' : field === 'newPassword' ? 'Mật khẩu mới' : 'Xác nhận mật khẩu mới'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPw[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] ? 'text' : 'password'}
                                value={pwForm[field]}
                                onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })}
                                className={inputClass}
                                style={inputStyle}
                                placeholder="••••••••"
                                required
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636B7F] hover:text-white cursor-pointer" onClick={() => {
                                const key = field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm';
                                setShowPw({ ...showPw, [key]: !showPw[key] });
                            }}>
                                {showPw[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                ))}

                <button type="submit" disabled={changingPw} className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-medium disabled:opacity-50 hover:brightness-110 transition-all cursor-pointer" style={{ background: '#F59E0B' }}>
                    {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {changingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
            </form>
        </div>
    );
}
