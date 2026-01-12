'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { Header } from '@/components/layout/Header';
import { User, Mail, Calendar, Shield, Lock, Save, Loader2, Sparkles, Check, X, ArrowLeft, Edit2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { validatePassword, getStrengthColor, getStrengthLabel } from '@/lib/passwordValidation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { BioEditor } from '@/components/profile/BioEditor';

export default function SettingsPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { isLowPerformanceMode } = usePerformance();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmationPassword: ''
    });

    // Password validation
    const passwordValidation = useMemo(() => validatePassword(passwords.newPassword), [passwords.newPassword]);
    const passwordsMatch = passwords.newPassword === passwords.confirmationPassword;

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        // Validate password strength
        if (!passwordValidation.isValid) {
            setIsError(true);
            setMessage('Mật khẩu mới chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu.');
            return;
        }

        if (!passwordsMatch) {
            setIsError(true);
            setMessage(t('settings.passwordMismatch') || 'Mật khẩu mới không khớp');
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
            <main className="min-h-screen text-foreground selection:bg-primary/30 relative flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="glass-card-strong p-8 rounded-3xl text-center max-w-md w-full border border-white/10">
                        <Lock className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {t('trial.loginRequired') || 'Yêu cầu đăng nhập'}
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            Vui lòng đăng nhập để truy cập cài đặt tài khoản của bạn.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative">
            {/* Base background */}
            <div className="fixed inset-0 bg-background -z-20" />

            {/* Background Effects */}
            {!isLowPerformanceMode && (
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    {/* Top center glow */}
                    <div
                        className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] animate-pulse"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)',
                            filter: 'blur(80px)',
                            animationDuration: '8s'
                        }}
                    />

                    {/* Bottom right glow */}
                    <div
                        className="absolute bottom-0 right-0 w-[800px] h-[600px] animate-pulse"
                        style={{
                            background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.1) 0%, transparent 60%)', // Pink/Rose tint
                            filter: 'blur(100px)',
                            animationDelay: '2s',
                            animationDuration: '10s'
                        }}
                    />
                </div>
            )}

            <Header />

            <div className="container max-w-6xl mx-auto px-4 lg:px-8 py-12">

                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">{t('nav.home') || 'Trang chủ'}</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black font-mono-tech uppercase tracking-tight flex items-center gap-3 text-gradient-cyan">
                            {t('settings.title') || 'Cài đặt tài khoản'}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Quản lý thông tin hồ sơ và bảo mật của bạn
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Profile Card (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card-strong rounded-3xl p-8 text-center shadow-xl shadow-black/20 border border-white/10 relative overflow-hidden group">
                            {/* Decorative gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50" />

                            <div className="mb-6 group-hover:scale-105 transition-transform duration-500">
                                <AvatarUpload
                                    currentAvatarUrl={user.avatarUrl}
                                    username={user.username}
                                />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
                                <p className="text-sm text-foreground/60 mb-4 bg-white/5 inline-block px-3 py-1 rounded-full border border-white/5">
                                    {user.email}
                                </p>

                                {/* Bio Section */}
                                <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5 text-left">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Giới thiệu</p>
                                    <BioEditor currentBio={user.bio || ''} />
                                </div>

                                <div className="grid gap-3 text-left bg-black/20 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-3 p-2">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t('settings.role') || 'VAI TRÒ'}</p>
                                            <p className="text-sm font-semibold text-white">{user.role}</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-white/5" />
                                    <div className="flex items-center gap-3 p-2">
                                        <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t('settings.joined') || 'THAM GIA'}</p>
                                            <p className="text-sm font-semibold text-white">
                                                {new Date().toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Forms (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Basic Info */}
                        <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <User className="w-32 h-32" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                                <span className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <User className="w-5 h-5" />
                                </span>
                                {t('settings.profile') || 'Thông tin chung'}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">{t('settings.username')}</label>
                                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white opacity-60">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        {user.username}
                                        <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded text-muted-foreground">Read-only</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">{t('settings.email')}</label>
                                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white opacity-60">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        {user.email}
                                        <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded text-muted-foreground">Read-only</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Lock className="w-32 h-32" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                                <span className="p-2 rounded-lg bg-accent/20 text-accent">
                                    <Lock className="w-5 h-5" />
                                </span>
                                {t('settings.security') || 'Bảo mật'}
                            </h2>

                            <form onSubmit={handleChangePassword} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white ml-1">{t('settings.currentPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            value={passwords.currentPassword}
                                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-white placeholder:text-muted-foreground/50"
                                            placeholder="••••••••"
                                        />
                                        <Lock className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-yellow-500/80 mb-2">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="font-semibold">Đặt mật khẩu mới</span>
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white ml-1">{t('settings.newPassword')}</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-white placeholder:text-muted-foreground/50"
                                            placeholder="••••••••"
                                        />

                                        {/* Password Strength Indicator */}
                                        {passwords.newPassword.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {/* Strength Bar */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full transition-all duration-300",
                                                                getStrengthColor(passwordValidation.strength)
                                                            )}
                                                            style={{
                                                                width: `${Object.values(passwordValidation.checks).filter(Boolean).length * 20}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className={cn(
                                                        "text-xs font-medium",
                                                        passwordValidation.strength === 'very-strong' && 'text-green-400',
                                                        passwordValidation.strength === 'strong' && 'text-blue-400',
                                                        passwordValidation.strength === 'medium' && 'text-yellow-400',
                                                        passwordValidation.strength === 'weak' && 'text-red-400'
                                                    )}>
                                                        {getStrengthLabel(passwordValidation.strength)}
                                                    </span>
                                                </div>

                                                {/* Requirements Checklist */}
                                                <div className="grid grid-cols-2 gap-1.5 text-xs">
                                                    <div className={cn("flex items-center gap-1", passwordValidation.checks.minLength ? 'text-green-400' : 'text-muted-foreground')}>
                                                        {passwordValidation.checks.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                        Tối thiểu 8 ký tự
                                                    </div>
                                                    <div className={cn("flex items-center gap-1", passwordValidation.checks.hasUppercase ? 'text-green-400' : 'text-muted-foreground')}>
                                                        {passwordValidation.checks.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                        Chữ hoa (A-Z)
                                                    </div>
                                                    <div className={cn("flex items-center gap-1", passwordValidation.checks.hasLowercase ? 'text-green-400' : 'text-muted-foreground')}>
                                                        {passwordValidation.checks.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                        Chữ thường (a-z)
                                                    </div>
                                                    <div className={cn("flex items-center gap-1", passwordValidation.checks.hasNumber ? 'text-green-400' : 'text-muted-foreground')}>
                                                        {passwordValidation.checks.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                        Số (0-9)
                                                    </div>
                                                    <div className={cn("flex items-center gap-1 col-span-2", passwordValidation.checks.hasSpecialChar ? 'text-green-400' : 'text-muted-foreground')}>
                                                        {passwordValidation.checks.hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                        Ký tự đặc biệt (@$!%*?&)
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white ml-1">{t('settings.confirmNewPassword')}</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                required
                                                value={passwords.confirmationPassword}
                                                onChange={(e) => setPasswords({ ...passwords, confirmationPassword: e.target.value })}
                                                className={cn(
                                                    "w-full px-4 py-3 pr-10 rounded-xl bg-black/20 border outline-none transition-all text-white placeholder:text-muted-foreground/50",
                                                    passwords.confirmationPassword && !passwordsMatch
                                                        ? "border-red-500/50 focus:border-red-500"
                                                        : passwords.confirmationPassword && passwordsMatch
                                                            ? "border-green-500/50 focus:border-green-500"
                                                            : "border-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                                                )}
                                                placeholder="••••••••"
                                            />
                                            {passwords.confirmationPassword && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {passwordsMatch ? (
                                                        <Check className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Message Alert */}
                                {message && (
                                    <div className={cn(
                                        "p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 flex items-center gap-3",
                                        isError ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    )}>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            isError ? "bg-red-500" : "bg-emerald-500"
                                        )} />
                                        {message}
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
                                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-bold text-sm tracking-wide shadow-lg shadow-accent/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                {t('settings.updatePassword') || 'Cập nhật mật khẩu'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
