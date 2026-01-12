'use client';

import { useState, useMemo } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, UserPlus, Loader2, Check, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePassword, getStrengthColor, getStrengthLabel } from '@/lib/passwordValidation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
    const { t } = useLanguage();
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Password validation
    const passwordValidation = useMemo(() => validatePassword(password), [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate password strength
        if (!passwordValidation.isValid) {
            setError('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.');
            return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);

        try {
            await register({ username, email, password });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
            <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="glass-card-strong rounded-3xl p-8 shadow-2xl shadow-accent/10">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                            <UserPlus className="w-8 h-8 text-accent" />
                        </div>
                        <h2 className="text-2xl font-bold text-gradient-magic">
                            {t('auth.register') || 'Đăng ký'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t('auth.registerDesc') || 'Tạo tài khoản để trải nghiệm đầy đủ'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t('auth.username') || 'Tên người dùng'}
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="gamer2024"
                                    required
                                    minLength={3}
                                    maxLength={50}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

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
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
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
                                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password.length > 0 && (
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
                                            {passwordValidation.checks.minLength ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                                            Tối thiểu 8 ký tự
                                        </div>
                                        <div className={cn("flex items-center gap-1", passwordValidation.checks.hasUppercase ? 'text-green-400' : 'text-muted-foreground')}>
                                            {passwordValidation.checks.hasUppercase ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                                            Chữ hoa (A-Z)
                                        </div>
                                        <div className={cn("flex items-center gap-1", passwordValidation.checks.hasLowercase ? 'text-green-400' : 'text-muted-foreground')}>
                                            {passwordValidation.checks.hasLowercase ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                                            Chữ thường (a-z)
                                        </div>
                                        <div className={cn("flex items-center gap-1", passwordValidation.checks.hasNumber ? 'text-green-400' : 'text-muted-foreground')}>
                                            {passwordValidation.checks.hasNumber ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                                            Số (0-9)
                                        </div>
                                        <div className={cn("flex items-center gap-1 col-span-2", passwordValidation.checks.hasSpecialChar ? 'text-green-400' : 'text-muted-foreground')}>
                                            {passwordValidation.checks.hasSpecialChar ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                                            Ký tự đặc biệt (@$!%*?&)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t('auth.confirmPassword') || 'Xác nhận mật khẩu'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className={cn(
                                        "w-full pl-12 pr-10 py-3 rounded-xl bg-white/5 border outline-none transition-all text-foreground placeholder:text-muted-foreground",
                                        confirmPassword && password !== confirmPassword
                                            ? "border-red-500/50 focus:border-red-500"
                                            : confirmPassword && password === confirmPassword
                                                ? "border-green-500/50 focus:border-green-500"
                                                : "border-white/10 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                                    )}
                                />
                                {confirmPassword && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {password === confirmPassword ? (
                                            <Check className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <XIcon className="w-5 h-5 text-red-400" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !passwordValidation.isValid}
                            className={cn(
                                "w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 mt-4",
                                "bg-gradient-to-r from-accent to-primary text-white",
                                "hover:brightness-110 hover:shadow-lg hover:shadow-accent/30",
                                "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                                "flex items-center justify-center gap-2"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('auth.registering') || 'Đang đăng ký...'}
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    {t('auth.createAccount') || 'Tạo tài khoản'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            {t('auth.or') || 'hoặc'}
                        </span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Switch to Login */}
                    <p className="text-center text-sm text-muted-foreground">
                        {t('auth.hasAccount') || 'Đã có tài khoản?'}{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-accent hover:text-accent/80 font-semibold transition-colors"
                        >
                            {t('auth.login') || 'Đăng nhập'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
