'use client';

import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import { Eye, EyeOff, UserPlus, Lock, Mail, User, Loader2, Check, X as XIcon, Gamepad2 } from 'lucide-react';
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
    const {
        username, setUsername, email, setEmail, password, setPassword,
        confirmPassword, setConfirmPassword, showPassword, setShowPassword,
        isLoading, error, passwordValidation, handleSubmit, t
    } = useRegisterForm(onClose);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-300">
                <div className="auth-card p-6 md:p-7">
                    <div className="relative z-10">
                        {/* Header — compact inline */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Gamepad2 className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">{t('authPage.registerTitle') || 'Tạo tài khoản'}</h2>
                                <p className="text-[11px] text-white/40">{t('authPage.registerDesc') || 'Đăng ký để trải nghiệm đầy đủ'}</p>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in duration-200">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t('auth.username') || 'Username'} required minLength={3} maxLength={50}
                                    className="auth-input !py-2.5 !pl-9 !text-sm" />
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('auth.email') || 'Email'} required
                                    className="auth-input !py-2.5 !pl-9 !text-sm" />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password') || 'Mật khẩu'} required
                                    className="auth-input !py-2.5 !pl-10 !pr-10 !text-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password Strength — compact */}
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
                                        )}>
                                            {getStrengthLabel(passwordValidation.strength)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[10px]">
                                        {[
                                            { key: 'minLength', label: t('authPage.pwd.minLength') || '8+ chars' },
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

                            {/* Confirm Password */}
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth.confirmPassword') || 'Xác nhận mật khẩu'} required
                                    className={cn("auth-input !py-2.5 !pl-10 !pr-10 !text-sm",
                                        confirmPassword && password !== confirmPassword && "!border-red-500/40",
                                        confirmPassword && password === confirmPassword && "!border-green-500/40"
                                    )} />
                                {confirmPassword && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        {password === confirmPassword ? <Check className="w-4 h-4 text-green-400" /> : <XIcon className="w-4 h-4 text-red-400" />}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading || !passwordValidation.isValid}
                                className="auth-submit-btn !py-2.5 !text-xs !mt-4 cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, hsl(270, 80%, 55%) 0%, hsl(200, 100%, 50%) 100%)' }}>
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />{t('auth.registering') || 'Đang đăng ký...'}</>
                                ) : (
                                    <><UserPlus className="w-4 h-4" />{t('auth.createAccount') || 'Tạo tài khoản'}</>
                                )}
                            </button>
                        </form>

                        {/* Switch to Login */}
                        <p className="text-center text-xs text-white/35 mt-4">
                            {t('auth.hasAccount') || 'Đã có tài khoản?'}{' '}
                            <button onClick={onSwitchToLogin}
                                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors cursor-pointer">
                                {t('authPage.loginNow') || 'Đăng nhập'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
