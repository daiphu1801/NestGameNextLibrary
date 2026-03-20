'use client';

import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { Eye, EyeOff, LogIn, Lock, Mail, Loader2, AlertCircle, UserPlus, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
    onForgotPassword?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, onForgotPassword }: LoginModalProps) {
    const {
        email, setEmail, password, setPassword, rememberMe, setRememberMe,
        showPassword, setShowPassword, isLoading, errorInfo, handleSubmit, t
    } = useLoginForm(onClose);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-300">
                <div className="auth-card p-6 md:p-7">
                    <div className="relative z-10">
                        {/* Header — compact inline */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">{t('authPage.loginTitle') || 'Đăng nhập'}</h2>
                                <p className="text-[11px] text-white/40">{t('authPage.loginDesc') || 'Đăng nhập để lưu tiến trình'}</p>
                            </div>
                        </div>

                        {/* Error */}
                        {errorInfo && (
                            <div className={cn("mb-4 p-3 rounded-xl border text-xs animate-in fade-in duration-200",
                                errorInfo.type === 'user_not_found' ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"
                            )}>
                                <div className="flex items-start gap-2">
                                    <AlertCircle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", errorInfo.type === 'user_not_found' ? "text-amber-400" : "text-red-400")} />
                                    <div className="flex-1">
                                        <p className={errorInfo.type === 'user_not_found' ? "text-amber-400" : "text-red-400"}>{errorInfo.message}</p>
                                        {errorInfo.type === 'user_not_found' && (
                                            <button onClick={onSwitchToRegister}
                                                className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 transition-colors cursor-pointer">
                                                <UserPlus className="w-3 h-3" /> {t('authPage.createNewAccount') || 'Đăng ký mới'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('auth.email') || 'Email'} required
                                    className={cn("auth-input !py-2.5 !pl-10 !text-sm", errorInfo?.type === 'user_not_found' && "!border-amber-500/50")} />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password') || 'Mật khẩu'} required
                                    className={cn("auth-input !py-2.5 !pl-10 !pr-10 !text-sm", errorInfo?.type === 'wrong_password' && "!border-red-500/50")} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-1.5 cursor-pointer group">
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
                                {onForgotPassword && (
                                    <button type="button" onClick={onForgotPassword}
                                        className="text-[11px] text-cyan-400/70 hover:text-cyan-400 transition-colors cursor-pointer">
                                        {t('auth.forgotPassword') || 'Quên mật khẩu?'}
                                    </button>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading} className="auth-submit-btn !py-2.5 !text-xs cursor-pointer">
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />{t('auth.loggingIn') || 'Đang đăng nhập...'}</>
                                ) : (
                                    <><LogIn className="w-4 h-4" />{t('auth.login') || 'Đăng nhập'}</>
                                )}
                            </button>
                        </form>

                        {/* Switch to Register */}
                        <p className="text-center text-xs text-white/35 mt-4">
                            {t('auth.noAccount') || "Chưa có tài khoản?"}{' '}
                            <button onClick={onSwitchToRegister}
                                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer">
                                {t('authPage.registerNow') || 'Đăng ký ngay'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
