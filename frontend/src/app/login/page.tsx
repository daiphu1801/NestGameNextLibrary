'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle, UserPlus, ArrowLeft, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

// SVG icons for OAuth providers
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    );
}

function DiscordIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
    );
}

// Error message mapping
function getFriendlyErrorMessage(error: string, t: (key: string) => string): { message: string; type: 'invalid_credentials' | 'network' | 'generic' } {
    const lowerError = error.toLowerCase();
    if (lowerError.includes('user not found') || lowerError.includes('không tìm thấy') || lowerError.includes('not exist') ||
        lowerError.includes('invalid password') || lowerError.includes('wrong password') || lowerError.includes('sai mật khẩu') || lowerError.includes('bad credentials')) {
        return { message: t('authPage.error.invalidCredentials') || 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.', type: 'invalid_credentials' };
    }
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection') || lowerError.includes('server')) {
        return { message: t('authPage.error.network') || 'Không thể kết nối đến server. Vui lòng thử lại sau.', type: 'network' };
    }
    return { message: error || t('authPage.error.generic') || 'Đăng nhập thất bại. Vui lòng thử lại.', type: 'generic' };
}

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const { login, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorInfo, setErrorInfo] = useState<{ message: string; type: string } | null>(null);

    useEffect(() => { if (user) router.push('/'); }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorInfo(null);
        setIsLoading(true);
        try {
            await login({ login: email, password }, rememberMe);
            router.push('/');
        } catch (err: any) {
            setErrorInfo(getFriendlyErrorMessage(err.message || 'Unknown error', t));
        } finally {
            setIsLoading(false);
        }
    };

    if (user) return null;

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative flex items-center justify-center p-4">
            {/* Background */}
            <div className="fixed inset-0 bg-[#060b18] -z-20" />
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px]"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(0, 180, 230, 0.12) 0%, rgba(0, 140, 200, 0.04) 40%, transparent 70%)', filter: 'blur(60px)' }} />
                <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[400px] animate-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(0, 200, 180, 0.06) 0%, transparent 60%)', filter: 'blur(80px)', animationDuration: '8s' }} />
            </div>

            {/* Back */}
            <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors group z-10">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">{t('authPage.backHome') || 'Trang chủ'}</span>
            </Link>

            {/* Card */}
            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-400">
                <div className="auth-card p-7 md:p-8">
                    <div className="relative z-10">
                        {/* Header - compact */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{t('authPage.loginTitle') || 'Đăng nhập'}</h1>
                                <p className="text-xs text-white/40">{t('authPage.loginDesc') || 'Đăng nhập để lưu tiến trình và game yêu thích'}</p>
                            </div>
                        </div>

                        {/* Error */}
                        {errorInfo && (
                            <div className={cn("mb-4 p-3 rounded-xl border text-sm animate-in fade-in duration-200",
                                errorInfo.type === 'user_not_found' ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"
                            )}>
                                <div className="flex items-start gap-2.5">
                                    <AlertCircle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", errorInfo.type === 'user_not_found' ? "text-amber-400" : "text-red-400")} />
                                    <div className="flex-1">
                                        <p className={cn("text-xs", errorInfo.type === 'user_not_found' ? "text-amber-400" : "text-red-400")}>{errorInfo.message}</p>
                                        {errorInfo.type === 'user_not_found' && (
                                            <Link href="/register" className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 transition-colors">
                                                <UserPlus className="w-3 h-3" /> {t('authPage.createNewAccount') || 'Đăng ký tài khoản mới'}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('auth.email') || 'Email'} required
                                    className={cn("auth-input !py-3 !pl-10 !text-sm", errorInfo?.type === 'user_not_found' && "!border-amber-500/50")} />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password') || 'Mật khẩu'} required
                                    className={cn("auth-input !py-3 !pl-10 !pr-10 !text-sm", errorInfo?.type === 'wrong_password' && "!border-red-500/50")} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Remember & Forgot — inline */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                            className="peer w-3.5 h-3.5 rounded border border-white/15 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all appearance-none cursor-pointer" />
                                        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] text-white/35 group-hover:text-white/60 transition-colors select-none">{t('auth.rememberMe') || 'Ghi nhớ'}</span>
                                </label>
                                <Link href="/reset-password" className="text-[11px] text-cyan-400/70 hover:text-cyan-400 transition-colors">
                                    {t('auth.forgotPassword') || 'Quên mật khẩu?'}
                                </Link>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={isLoading} className="auth-submit-btn !py-3 !text-xs cursor-pointer">
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />{t('auth.loggingIn') || 'Đang đăng nhập...'}</>
                                ) : (
                                    <><LogIn className="w-4 h-4" />{t('auth.login') || 'Đăng nhập'}</>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-white/8" />
                            <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">{t('authPage.orContinueWith') || 'OR'}</span>
                            <div className="flex-1 h-px bg-white/8" />
                        </div>

                        {/* OAuth — horizontal row of 3 icon buttons */}
                        <div className="grid grid-cols-3 gap-3">
                            <button disabled className="auth-social-btn !justify-center !px-0 !py-2.5 group" title={`${t('authPage.continueWith') || 'Continue with'} Google`}>
                                <GoogleIcon className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400/60 font-bold">
                                    {t('authPage.comingSoon') || 'Soon'}
                                </span>
                            </button>
                            <button disabled className="auth-social-btn !justify-center !px-0 !py-2.5 group" title={`${t('authPage.continueWith') || 'Continue with'} GitHub`}>
                                <GitHubIcon className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400/60 font-bold">
                                    {t('authPage.comingSoon') || 'Soon'}
                                </span>
                            </button>
                            <button disabled className="auth-social-btn !justify-center !px-0 !py-2.5 group" title={`${t('authPage.continueWith') || 'Continue with'} Discord`}>
                                <DiscordIcon className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400/60 font-bold">
                                    {t('authPage.comingSoon') || 'Soon'}
                                </span>
                            </button>
                        </div>

                        {/* Switch to Register */}
                        <p className="text-center text-xs text-white/35 mt-5">
                            {t('auth.noAccount') || "Chưa có tài khoản?"}{' '}
                            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                                {t('authPage.registerNow') || 'Đăng ký ngay'}
                            </Link>
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
