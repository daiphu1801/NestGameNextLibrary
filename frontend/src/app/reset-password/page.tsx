'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/authService';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        if (!token) {
            setError('Token không hợp lệ');
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword(token, newPassword);
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className=" glass-card-strong rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-3">Link không hợp lệ</h1>
                    <p className="text-muted-foreground mb-6">Link đặt lại mật khẩu không tồn tại hoặc đã hết hạn.</p>
                    <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-medium transition-all">
                        Quay về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

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
                    {isSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">
                                Đặt lại thành công!
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Mật khẩu của bạn đã được thay đổi. Bạn sẽ được chuyển về trang chủ sau giây lát...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-gradient-cyan">
                                    Đặt lại mật khẩu
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Nhập mật khẩu mới của bạn
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password Field */}
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

                                {/* Confirm Password Field */}
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
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
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
