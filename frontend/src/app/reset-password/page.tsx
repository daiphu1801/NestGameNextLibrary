'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle, Loader2, Eye, EyeOff, ArrowLeft, Mail, Send, ShieldCheck, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/authService';
import Link from 'next/link';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ResetPasswordPage() {
    const router = useRouter();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
            setError('Mật khẩu không khớp');
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
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStepIcon = () => {
        switch (step) {
            case 'email': return <Mail className="w-8 h-8 text-primary" />;
            case 'otp': return <ShieldCheck className="w-8 h-8 text-primary" />;
            case 'password': return <KeyRound className="w-8 h-8 text-primary" />;
            case 'success': return <CheckCircle className="w-10 h-10 text-green-500" />;
        }
    };

    const getBackAction = () => {
        switch (step) {
            case 'otp': return () => setStep('email');
            case 'password': return () => setStep('otp');
            default: return undefined;
        }
    };

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative flex items-center justify-center p-4">
            {/* Base background */}
            <div className="fixed inset-0 bg-background -z-20" />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div
                    className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] animate-pulse"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)',
                        filter: 'blur(80px)',
                        animationDuration: '8s'
                    }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[800px] h-[600px] animate-pulse"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.1) 0%, transparent 60%)',
                        filter: 'blur(100px)',
                        animationDelay: '2s',
                        animationDuration: '10s'
                    }}
                />
            </div>

            {/* Back link */}
            <Link
                href="/"
                className="fixed top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Trang chủ</span>
            </Link>

            {/* Reset Form */}
            <div className="w-full max-w-md">
                <div className="glass-card-strong rounded-3xl p-8 shadow-2xl shadow-primary/10">

                    {/* Back button for steps */}
                    {getBackAction() && (
                        <button
                            onClick={getBackAction()}
                            className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại
                        </button>
                    )}

                    {/* ========== SUCCESS STATE ========== */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
                                {getStepIcon()}
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">
                                Đặt lại thành công! 🎉
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Mật khẩu của bạn đã được thay đổi. Bạn sẽ được chuyển về trang chủ sau giây lát...
                            </p>
                        </div>
                    )}

                    {/* ========== STEP 1: EMAIL ========== */}
                    {step === 'email' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    {getStepIcon()}
                                </div>
                                <h2 className="text-2xl font-bold text-gradient-cyan">
                                    Đặt lại mật khẩu
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Nhập email đã đăng ký để nhận mã OTP
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

                    {/* ========== STEP 2: OTP ========== */}
                    {step === 'otp' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    {getStepIcon()}
                                </div>
                                <h2 className="text-2xl font-bold text-gradient-cyan">
                                    Nhập mã OTP
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Nếu email đã được đăng ký, mã OTP 6 số sẽ được gửi đến hộp thư của bạn
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

                    {/* ========== STEP 3: NEW PASSWORD ========== */}
                    {step === 'password' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    {getStepIcon()}
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
                                    <label className="text-sm font-medium text-foreground">
                                        Mật khẩu mới
                                    </label>
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
                                    <label className="text-sm font-medium text-foreground">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
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
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <KeyRound className="w-5 h-5" />
                                            Đặt lại mật khẩu
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
