'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, KeyRound, CheckCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { authService } from '@/services/authService';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBackToLogin: () => void;
}

type Step = 'email' | 'otp' | 'password' | 'success';

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await authService.requestPasswordReset(email);
            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await authService.verifyOtp(email, otp);
            setStep('password');
        } catch (err: any) {
            setError(err.message || 'Mã OTP không hợp lệ.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(email, otp, newPassword);
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Không thể đặt lại mật khẩu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setStep('email');
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onBackToLogin();
    };

    // Step indicator labels
    const steps = [
        { key: 'email', label: t('auth.email') || 'Email' },
        { key: 'otp', label: 'OTP' },
        { key: 'password', label: t('auth.password') || 'Password' },
    ];
    const currentStepIndex = step === 'success' ? 3 : steps.findIndex(s => s.key === step);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-300">
                <div className="auth-card p-8">
                    <div className="relative z-10">

                        {/* Step Indicator */}
                        {step !== 'success' && (
                            <div className="flex items-center justify-center gap-2 mb-6">
                                {steps.map((s, i) => (
                                    <div key={s.key} className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                            i <= currentStepIndex
                                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                                                : "bg-white/5 text-white/25 border border-white/10"
                                        )}>
                                            {i < currentStepIndex ? (
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            ) : (
                                                i + 1
                                            )}
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className={cn(
                                                "w-8 h-px transition-all duration-300",
                                                i < currentStepIndex ? "bg-cyan-500/30" : "bg-white/10"
                                            )} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* STEP: Email */}
                        {step === 'email' && (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                                        <KeyRound className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {t('auth.resetPassword') || 'Đặt lại mật khẩu'}
                                    </h2>
                                    <p className="text-sm text-white/40 mt-1.5">
                                        {t('auth.resetDesc') || 'Nhập email để nhận mã xác nhận'}
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSendOTP} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/25" />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@email.com" required className="auth-input" />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="auth-submit-btn cursor-pointer">
                                        {isLoading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" />Đang gửi...</>
                                        ) : (
                                            <>Gửi mã OTP</>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* STEP: OTP */}
                        {step === 'otp' && (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Nhập mã OTP
                                    </h2>
                                    <p className="text-sm text-white/40 mt-1.5">
                                        Mã đã được gửi đến <span className="text-cyan-400 font-medium">{email}</span>
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleVerifyOTP} className="space-y-4">
                                    <input
                                        type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                                        placeholder="000000" required maxLength={6}
                                        className="auth-input text-center text-2xl tracking-[0.5em] font-mono !pl-4"
                                    />
                                    <button type="submit" disabled={isLoading} className="auth-submit-btn cursor-pointer">
                                        {isLoading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" />Đang xác minh...</>
                                        ) : (
                                            <>Xác nhận</>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* STEP: New Password */}
                        {step === 'password' && (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                                        <Lock className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Mật khẩu mới
                                    </h2>
                                    <p className="text-sm text-white/40 mt-1.5">
                                        Nhập mật khẩu mới cho tài khoản của bạn
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/25" />
                                        <input type={showPassword ? 'text' : 'password'} value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" required
                                            className="auth-input !pr-12" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer">
                                            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/25" />
                                        <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu" required
                                            className={cn("auth-input",
                                                confirmPassword && newPassword !== confirmPassword && "!border-red-500/40",
                                                confirmPassword && newPassword === confirmPassword && "!border-green-500/40"
                                            )} />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="auth-submit-btn cursor-pointer">
                                        {isLoading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" />Đang xử lý...</>
                                        ) : (
                                            <>Đặt lại mật khẩu</>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* STEP: Success */}
                        {step === 'success' && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Đặt lại thành công! 🎉
                                </h2>
                                <p className="text-sm text-white/40 mb-6">
                                    Mật khẩu đã được đặt lại. Bạn có thể đăng nhập ngay.
                                </p>
                                <button onClick={handleBackToLogin} className="auth-submit-btn cursor-pointer">
                                    Đăng nhập ngay
                                </button>
                            </div>
                        )}

                        {/* Back to Login */}
                        {step !== 'success' && (
                            <div className="mt-5 text-center">
                                <button onClick={handleBackToLogin}
                                    className="text-sm text-white/35 hover:text-white/60 transition-colors inline-flex items-center gap-1.5 cursor-pointer">
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    {t('auth.backToLogin') || 'Quay lại đăng nhập'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
