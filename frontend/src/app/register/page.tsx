'use client';

import { Mail, Lock, Eye, EyeOff, UserPlus, User, Loader2, Check, X as XIcon, ArrowLeft, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStrengthColor, getStrengthLabel } from '@/lib/passwordValidation';
import Link from 'next/link';
import { useRegisterPage } from '@/features/auth/hooks/useRegisterPage';

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    );
}

export default function RegisterPage() {
    const {
        username, setUsername, email, setEmail,
        password, setPassword, confirmPassword, setConfirmPassword,
        showPassword, setShowPassword,
        isLoading, error, user, t,
        passwordValidation, passwordsMatch,
        handleSubmit,
    } = useRegisterPage();

    if (user) return null;

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative flex items-center justify-center p-4 py-8">
            <div className="fixed inset-0 bg-[#060b18] -z-20" />
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px]"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(130, 80, 220, 0.12) 0%, rgba(90, 50, 180, 0.04) 40%, transparent 70%)', filter: 'blur(60px)' }} />
                <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[400px] animate-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(0, 200, 180, 0.06) 0%, transparent 60%)', filter: 'blur(80px)', animationDuration: '8s' }} />
            </div>

            <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors group z-10">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">{t('authPage.backHome') || 'Trang chủ'}</span>
            </Link>

            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-400">
                <div className="auth-card p-7 md:p-8">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Gamepad2 className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{t('authPage.registerTitle') || 'Tạo tài khoản'}</h1>
                                <p className="text-xs text-white/40">{t('authPage.registerDesc') || 'Đăng ký để trải nghiệm đầy đủ tính năng'}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in duration-200">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t('auth.username') || 'Username'} required minLength={3} maxLength={50}
                                    className="auth-input !py-3 !pl-10 !text-sm" />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('auth.email') || 'Email'} required
                                    className="auth-input !py-3 !pl-10 !text-sm" />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password') || 'Mật khẩu'} required
                                    className="auth-input !py-3 !pl-10 !pr-10 !text-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {password.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className={cn("h-full transition-all duration-300 rounded-full", getStrengthColor(passwordValidation.strength))}
                                                style={{ width: `${Object.values(passwordValidation.checks).filter(Boolean).length * 20}%` }} />
                                        </div>
                                        <span className={cn("text-[9px] font-bold uppercase tracking-wider",
                                            passwordValidation.strength === 'very-strong' && 'text-green-400',
                                            passwordValidation.strength === 'strong' && 'text-blue-400',
                                            passwordValidation.strength === 'medium' && 'text-yellow-400',
                                            passwordValidation.strength === 'weak' && 'text-red-400'
                                        )}>{getStrengthLabel(passwordValidation.strength)}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[10px]">
                                        {[
                                            { key: 'minLength', label: t('authPage.pwd.minLength') || '6+ chars' },
                                            { key: 'hasUppercase', label: t('authPage.pwd.uppercase') || 'A-Z' },
                                            { key: 'hasLowercase', label: t('authPage.pwd.lowercase') || 'a-z' },
                                            { key: 'hasNumber', label: t('authPage.pwd.number') || '0-9' },
                                            { key: 'hasSpecialChar', label: t('authPage.pwd.special') || '@$!%' },
                                        ].map(({ key, label }) => (
                                            <div key={key} className={cn("flex items-center gap-1", passwordValidation.checks[key as keyof typeof passwordValidation.checks] ? 'text-green-400/80' : 'text-white/20')}>
                                                {passwordValidation.checks[key as keyof typeof passwordValidation.checks] ? <Check className="w-2.5 h-2.5" /> : <XIcon className="w-2.5 h-2.5" />}
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth.confirmPassword') || 'Xác nhận mật khẩu'} required
                                    className={cn("auth-input !py-3 !pl-10 !pr-10 !text-sm",
                                        confirmPassword && !passwordsMatch && "!border-red-500/40",
                                        confirmPassword && passwordsMatch && "!border-green-500/40"
                                    )} />
                                {confirmPassword && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        {passwordsMatch ? <Check className="w-4 h-4 text-green-400" /> : <XIcon className="w-4 h-4 text-red-400" />}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="auth-submit-btn !py-3 !text-xs !mt-4 cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, hsl(270, 80%, 55%) 0%, hsl(200, 100%, 50%) 100%)' }}>
                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />{t('auth.registering') || 'Đang đăng ký...'}</>
                                    : <><UserPlus className="w-4 h-4" />{t('auth.createAccount') || 'Tạo tài khoản'}</>}
                            </button>
                        </form>

                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-white/8" />
                            <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t('authPage.orContinueWith') || 'OR'}</span>
                            <div className="flex-1 h-px bg-white/8" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button disabled className="auth-social-btn !justify-center !py-2.5 group relative" title={`${t('authPage.continueWith') || 'Continue with'} Google`}>
                                <GoogleIcon className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-400/10 text-violet-400/60 font-bold">{t('authPage.comingSoon') || 'Soon'}</span>
                            </button>
                            <button disabled className="auth-social-btn !justify-center !py-2.5 group relative" title={`${t('authPage.continueWith') || 'Continue with'} GitHub`}>
                                <GitHubIcon className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-400/10 text-violet-400/60 font-bold">{t('authPage.comingSoon') || 'Soon'}</span>
                            </button>
                        </div>

                        <p className="text-center text-xs text-white/35 mt-5">
                            {t('auth.hasAccount') || 'Đã có tài khoản?'}{' '}
                            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">{t('authPage.loginNow') || 'Đăng nhập'}</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] text-white/15 mt-4 flex items-center justify-center gap-1">
                    <Gamepad2 className="w-3 h-3" /> NestGame — {t('authPage.footerText') || 'Chơi game kinh điển miễn phí'}
                </p>
            </div>
        </main>
    );
}
