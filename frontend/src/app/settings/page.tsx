'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { Header } from '@/components/layout/Header';
import {
    User, Mail, Lock, Save, Loader2, Sparkles, Check, X,
    ArrowLeft, Gamepad2, Keyboard, Shield, ChevronRight, Calendar,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { validatePassword, getStrengthColor, getStrengthLabel } from '@/lib/passwordValidation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { BioEditor } from '@/components/profile/BioEditor';
import { KeybindingSelector } from '@/components/settings/KeybindingSelector';
import { GamepadSelector } from '@/components/settings/GamepadSelector';

type SettingSection = 'profile' | 'security' | 'keyboard' | 'gamepad';

const NAV_ITEMS: { id: SettingSection; icon: React.ElementType; labelKey: string; labelFb: string; color: string; gradient: string }[] = [
    { id: 'profile', icon: User, labelKey: 'settings.profile', labelFb: 'Hồ sơ', color: 'text-blue-400', gradient: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20' },
    { id: 'security', icon: Shield, labelKey: 'settings.security', labelFb: 'Bảo mật', color: 'text-purple-400', gradient: 'from-purple-500/20 to-pink-500/10 border-purple-500/20' },
    { id: 'keyboard', icon: Keyboard, labelKey: 'settings.gamepad.tabKeyboard', labelFb: 'Bàn phím', color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/20' },
    { id: 'gamepad', icon: Gamepad2, labelKey: 'settings.gamepad.tabGamepad', labelFb: 'Tay Cầm', color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-green-500/10 border-emerald-500/20' },
];

export default function SettingsPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { isLowPerformanceMode } = usePerformance();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [activeSection, setActiveSection] = useState<SettingSection>('profile');

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmationPassword: ''
    });

    const passwordValidation = useMemo(() => validatePassword(passwords.newPassword), [passwords.newPassword]);
    const passwordsMatch = passwords.newPassword === passwords.confirmationPassword;

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        if (!passwordValidation.isValid) {
            setIsError(true);
            setMessage('Mật khẩu mới chưa đủ mạnh.');
            return;
        }
        if (!passwordsMatch) {
            setIsError(true);
            setMessage(t('settings.passwordMismatch') || 'Mật khẩu không khớp');
            return;
        }
        setIsLoading(true);
        try {
            await authService.changePassword(passwords);
            setMessage(t('settings.passwordUpdated') || 'Đổi mật khẩu thành công');
            setPasswords({ currentPassword: '', newPassword: '', confirmationPassword: '' });
        } catch (err: any) {
            setIsError(true);
            setMessage(err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <main className="min-h-screen text-foreground flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="glass-card-strong p-10 rounded-3xl text-center max-w-md w-full border border-white/10">
                        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {t('trial.loginRequired') || 'Yêu cầu đăng nhập'}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('settings.loginRequiredDesc') || 'Vui lòng đăng nhập để truy cập cài đặt.'}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const activeNav = NAV_ITEMS.find(n => n.id === activeSection)!;

    return (
        <main className="min-h-screen text-foreground relative">
            {/* Background */}
            <div className="fixed inset-0 bg-background -z-20" />
            {!isLowPerformanceMode && (
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px]"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)', filter: 'blur(80px)' }} />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px]"
                        style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.08) 0%, transparent 60%)', filter: 'blur(100px)' }} />
                </div>
            )}

            <Header />

            <div className="container max-w-7xl mx-auto px-4 lg:px-8 py-10">

                {/* Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group text-sm">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('nav.home') || 'Trang chủ'}
                </Link>

                {/* Page title */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black font-mono-tech uppercase tracking-tight text-gradient-cyan">
                        {t('settings.title') || 'Cài đặt tài khoản'}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('settings.subtitle') || 'Quản lý thông tin hồ sơ và bảo mật'}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ═══════════════════════════════
                        LEFT SIDEBAR
                    ═══════════════════════════════ */}
                    <div className="w-full lg:w-72 shrink-0 space-y-3">

                        {/* Profile card compact */}
                        <div className="glass-card-strong rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
                            <div className="relative flex items-center gap-4">
                                <div className="shrink-0">
                                    <AvatarUpload currentAvatarUrl={user.avatarUrl} username={user.username} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-white text-lg truncate">{user.username}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="glass-card rounded-2xl p-2 border border-white/10 space-y-0.5">
                            {NAV_ITEMS.map(item => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group',
                                            isActive
                                                ? `bg-gradient-to-r ${item.gradient} ${item.color} border`
                                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        <Icon className={cn('w-4 h-4 shrink-0', isActive ? item.color : 'group-hover:text-white')} />
                                        <span className="flex-1 text-left">{t(item.labelKey) || item.labelFb}</span>
                                        {isActive && <ChevronRight className={cn('w-3.5 h-3.5', item.color)} />}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Bio card */}
                        <div className="glass-card rounded-2xl p-5 border border-white/10">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">{t('settings.bio') || 'Giới thiệu'}</p>
                            <BioEditor currentBio={user.bio || ''} />
                        </div>
                    </div>

                    {/* ═══════════════════════════════
                        MAIN CONTENT
                    ═══════════════════════════════ */}
                    <div className="flex-1 min-w-0">

                        {/* Section header strip */}
                        <div className={cn(
                            'flex items-center gap-3 px-5 py-4 rounded-2xl border mb-5 bg-gradient-to-r',
                            activeNav.gradient
                        )}>
                            <div className={cn('p-2 rounded-xl bg-black/20', activeNav.color)}>
                                <activeNav.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className={cn('font-bold text-base', activeNav.color)}>
                                    {t(activeNav.labelKey) || activeNav.labelFb}
                                </h2>
                                <p className="text-xs text-muted-foreground/80">
                                    {activeSection === 'profile' && (t('settings.profile') || 'Thông tin tài khoản')}
                                    {activeSection === 'security' && (t('settings.security') || 'Đổi mật khẩu bảo mật')}
                                    {activeSection === 'keyboard' && (t('settings.controlsDesc') || 'Tùy chỉnh phím bàn phím')}
                                    {activeSection === 'gamepad' && (t('settings.gamepad.desc') || 'Cấu hình nút tay cầm')}
                                </p>
                            </div>
                        </div>

                        {/* ── PROFILE ── */}
                        {activeSection === 'profile' && (
                            <div className="glass-card rounded-2xl p-8 border border-white/10">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">
                                            {t('settings.username') || 'Tên hiển thị'}
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white">
                                            <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="flex-1 font-medium">{user.username}</span>
                                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-muted-foreground">
                                                {t('settings.readOnly') || 'Read-only'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">
                                            {t('settings.email') || 'Email'}
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white">
                                            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="flex-1 font-medium">{user.email}</span>
                                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-muted-foreground">
                                                {t('settings.readOnly') || 'Read-only'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-xs text-blue-400/80">
                                        💡 Tên hiển thị và email không thể thay đổi. Liên hệ admin nếu cần cập nhật.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── SECURITY ── */}
                        {activeSection === 'security' && (
                            <div className="glass-card rounded-2xl p-8 border border-white/10">
                                <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                                    {/* Current password */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">
                                            {t('settings.currentPassword') || 'Mật khẩu hiện tại'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password" required
                                                value={passwords.currentPassword}
                                                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-white placeholder:text-muted-foreground/50"
                                                placeholder="••••••••"
                                            />
                                            <Lock className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </div>

                                    {/* New passwords */}
                                    <div className="p-5 rounded-xl bg-white/3 border border-white/5 space-y-4">
                                        <div className="flex items-center gap-2 text-sm text-yellow-400/80 mb-1">
                                            <Sparkles className="w-4 h-4" />
                                            <span className="font-semibold">{t('settings.setNewPassword') || 'Đặt mật khẩu mới'}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">
                                                {t('settings.newPassword') || 'Mật khẩu mới'}
                                            </label>
                                            <input
                                                type="password" required
                                                value={passwords.newPassword}
                                                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-white placeholder:text-muted-foreground/50"
                                                placeholder="••••••••"
                                            />
                                            {passwords.newPassword.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div className={cn("h-full transition-all duration-300", getStrengthColor(passwordValidation.strength))}
                                                                style={{ width: `${Object.values(passwordValidation.checks).filter(Boolean).length * 20}%` }} />
                                                        </div>
                                                        <span className={cn("text-xs font-medium",
                                                            passwordValidation.strength === 'very-strong' && 'text-green-400',
                                                            passwordValidation.strength === 'strong' && 'text-blue-400',
                                                            passwordValidation.strength === 'medium' && 'text-yellow-400',
                                                            passwordValidation.strength === 'weak' && 'text-red-400'
                                                        )}>{getStrengthLabel(passwordValidation.strength)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                                                        {[
                                                            { ok: passwordValidation.checks.minLength, label: t('settings.reqMinLength') || 'Tối thiểu 8 ký tự' },
                                                            { ok: passwordValidation.checks.hasUppercase, label: t('settings.reqUppercase') || 'Chữ hoa (A-Z)' },
                                                            { ok: passwordValidation.checks.hasLowercase, label: t('settings.reqLowercase') || 'Chữ thường (a-z)' },
                                                            { ok: passwordValidation.checks.hasNumber, label: t('settings.reqNumber') || 'Số (0-9)' },
                                                            { ok: passwordValidation.checks.hasSpecialChar, label: t('settings.reqSpecial') || 'Ký tự đặc biệt', colSpan: true },
                                                        ].map((req, i) => (
                                                            <div key={i} className={cn("flex items-center gap-1", req.colSpan && 'col-span-2', req.ok ? 'text-green-400' : 'text-muted-foreground')}>
                                                                {req.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                                {req.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">
                                                {t('settings.confirmNewPassword') || 'Xác nhận'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password" required
                                                    value={passwords.confirmationPassword}
                                                    onChange={e => setPasswords({ ...passwords, confirmationPassword: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-3 pr-10 rounded-xl bg-black/20 border outline-none transition-all text-white placeholder:text-muted-foreground/50",
                                                        passwords.confirmationPassword && !passwordsMatch ? "border-red-500/50 focus:border-red-500" :
                                                            passwords.confirmationPassword && passwordsMatch ? "border-green-500/50 focus:border-green-500" :
                                                                "border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                                    )}
                                                    placeholder="••••••••"
                                                />
                                                {passwords.confirmationPassword && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        {passwordsMatch ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    {message && (
                                        <div className={cn(
                                            "p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                                            isError ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        )}>
                                            <div className={cn("w-2 h-2 rounded-full", isError ? "bg-red-500" : "bg-emerald-500")} />
                                            {message}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
                                            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {isLoading ? (t('settings.updating') || 'Đang cập nhật...') : (t('settings.updatePassword') || 'Cập nhật mật khẩu')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ── KEYBOARD ── */}
                        {activeSection === 'keyboard' && (
                            <div className="glass-card rounded-2xl p-8 border border-white/10">
                                <KeybindingSelector />
                            </div>
                        )}

                        {/* ── GAMEPAD ── */}
                        {activeSection === 'gamepad' && (
                            <div className="glass-card rounded-2xl p-8 border border-white/10">
                                <GamepadSelector />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
