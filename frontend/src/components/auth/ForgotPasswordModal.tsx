'use client';

import { useState } from 'react';
import { X, Mail, ArrowLeft, Loader2, CheckCircle, Send, ShieldCheck, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
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

    const handleSendOtp = async (e: React.FormEvent) => {
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

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.verifyOtp(email, otp);
            setStep('password');
        } catch (err: any) {
            setError(err.message || 'Mã OTP không chính xác.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
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

    const handleClose = () => {
        setStep('email');
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    const handleBackToLogin = () => {
        handleClose();
        onBackToLogin();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                <div className="glass-card-strong rounded-3xl p-8 shadow-2xl shadow-primary/10">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Back Button */}
                    {step !== 'success' && (
                        <button
                            onClick={step === 'email' ? handleBackToLogin : () => setStep(step === 'otp' ? 'email' : 'otp')}
                            className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Success State */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">
                                Đặt lại mật khẩu thành công! 🎉
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
                            </p>
                            <button
                                onClick={handleBackToLogin}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold transition-all hover:brightness-110"
                            >
                                Đăng nhập ngay
                            </button>
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-gradient-cyan">
                                    Quên mật khẩu?
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Nhập email để nhận mã OTP xác thực
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </div>

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
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Gửi mã OTP
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    <ShieldCheck className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-gradient-cyan">
                                    Nhập mã OTP
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Chúng tôi đã gửi mã 6 số đến <span className="text-primary">{email}</span>
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Mã OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        required
                                        maxLength={6}
                                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground text-center text-2xl font-mono tracking-[0.5em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-base"
                                    />
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        ⏱️ Mã có hiệu lực trong 5 phút
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length !== 6}
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
                                            Đang xác thực...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" />
                                            Xác thực OTP
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setError(''); handleSendOtp({ preventDefault: () => { } } as React.FormEvent); }}
                                    disabled={isLoading}
                                    className="w-full text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                    Gửi lại mã OTP
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'password' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    <KeyRound className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-gradient-cyan">
                                    Đặt mật khẩu mới
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Tạo mật khẩu mạnh để bảo vệ tài khoản
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Mật khẩu mới</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </div>

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
                                            Đang đặt lại...
                                        </>
                                    ) : (
                                        <>
                                            <KeyRound className="w-5 h-5" />
                                            Đặt mật khẩu mới
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
