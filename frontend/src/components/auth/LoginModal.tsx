'use client';

import { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
    onForgotPassword: () => void;
}

// Error message mapping for user-friendly display
function getFriendlyErrorMessage(error: string): { message: string; type: 'user_not_found' | 'wrong_password' | 'network' | 'generic' } {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('user not found') || lowerError.includes('không tìm thấy') || lowerError.includes('not exist')) {
        return {
            message: 'Email này chưa được đăng ký. Hãy tạo tài khoản mới!',
            type: 'user_not_found'
        };
    }
    if (lowerError.includes('invalid password') || lowerError.includes('wrong password') || lowerError.includes('sai mật khẩu') || lowerError.includes('bad credentials')) {
        return {
            message: 'Mật khẩu không đúng. Vui lòng kiểm tra lại.',
            type: 'wrong_password'
        };
    }
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection') || lowerError.includes('server')) {
        return {
            message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
            type: 'network'
        };
    }

    return {
        message: error || 'Đăng nhập thất bại. Vui lòng thử lại.',
        type: 'generic'
    };
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, onForgotPassword }: LoginModalProps) {
    const { t } = useLanguage();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorInfo, setErrorInfo] = useState<{ message: string; type: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorInfo(null);
        setIsLoading(true);

        try {
            await login({ login: email, password }, rememberMe);
            onClose();
        } catch (err: any) {
            const friendly = getFriendlyErrorMessage(err.message || 'Unknown error');
            setErrorInfo(friendly);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                <div className="glass-card-strong rounded-3xl p-8 shadow-2xl shadow-primary/10">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <LogIn className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-gradient-cyan">
                            {t('auth.login') || 'Đăng nhập'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t('auth.loginDesc') || 'Đăng nhập để lưu tiến trình và game yêu thích'}
                        </p>
                    </div>

                    {/* Error Message - Enhanced UI */}
                    {errorInfo && (
                        <div className={cn(
                            "mb-6 p-4 rounded-xl border text-sm animate-in fade-in slide-in-from-top-2 duration-300",
                            errorInfo.type === 'user_not_found' && "bg-amber-500/10 border-amber-500/20",
                            errorInfo.type === 'wrong_password' && "bg-red-500/10 border-red-500/20",
                            errorInfo.type === 'network' && "bg-yellow-500/10 border-yellow-500/20",
                            errorInfo.type === 'generic' && "bg-destructive/10 border-destructive/20"
                        )}>
                            <div className="flex items-start gap-3">
                                <AlertCircle className={cn(
                                    "w-5 h-5 mt-0.5 flex-shrink-0",
                                    errorInfo.type === 'user_not_found' && "text-amber-400",
                                    errorInfo.type === 'wrong_password' && "text-red-400",
                                    errorInfo.type === 'network' && "text-yellow-400",
                                    errorInfo.type === 'generic' && "text-destructive"
                                )} />
                                <div className="flex-1">
                                    <p className={cn(
                                        "font-medium",
                                        errorInfo.type === 'user_not_found' && "text-amber-400",
                                        errorInfo.type === 'wrong_password' && "text-red-400",
                                        errorInfo.type === 'network' && "text-yellow-400",
                                        errorInfo.type === 'generic' && "text-destructive"
                                    )}>
                                        {errorInfo.message}
                                    </p>

                                    {/* Contextual action buttons */}
                                    {errorInfo.type === 'user_not_found' && (
                                        <button
                                            onClick={onSwitchToRegister}
                                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            Đăng ký tài khoản mới
                                        </button>
                                    )}
                                    {errorInfo.type === 'wrong_password' && (
                                        <button
                                            onClick={onForgotPassword}
                                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-colors"
                                        >
                                            Quên mật khẩu?
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t('auth.email') || 'Email'}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className={cn(
                                        "w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border outline-none transition-all text-foreground placeholder:text-muted-foreground",
                                        errorInfo?.type === 'user_not_found'
                                            ? "border-amber-500/50 focus:border-amber-500"
                                            : "border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t('auth.password') || 'Mật khẩu'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className={cn(
                                        "w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border outline-none transition-all text-foreground placeholder:text-muted-foreground",
                                        errorInfo?.type === 'wrong_password'
                                            ? "border-red-500/50 focus:border-red-500"
                                            : "border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer w-4 h-4 rounded border border-white/20 bg-white/5 checked:bg-primary checked:border-primary transition-all appearance-none cursor-pointer"
                                    />
                                    <svg
                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
                                    {t('auth.rememberMe') || 'Ghi nhớ đăng nhập'}
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                {t('auth.forgotPassword') || 'Quên mật khẩu?'}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300",
                                "bg-gradient-to-r from-primary to-accent text-white",
                                "hover:brightness-110 hover:shadow-lg hover:shadow-primary/30",
                                "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                                "flex items-center justify-center gap-2"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('auth.loggingIn') || 'Đang đăng nhập...'}
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    {t('auth.login') || 'Đăng nhập'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            {t('auth.or') || 'hoặc'}
                        </span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Switch to Register */}
                    <p className="text-center text-sm text-muted-foreground">
                        {t('auth.noAccount') || 'Chưa có tài khoản?'}{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="text-primary hover:text-primary/80 font-semibold transition-colors"
                        >
                            {t('auth.register') || 'Đăng ký ngay'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
