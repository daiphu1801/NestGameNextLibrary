'use client';

import { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, Gamepad2 } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // If already authenticated, redirect to dashboard
    if (typeof window !== 'undefined' && adminService.isAuthenticated()) {
        router.replace('/admin');
        return null;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await adminService.login(email, password);
            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,4%)] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ff00ff]/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#ff00ff] mb-4 shadow-lg shadow-[#00d4ff]/30">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        <span className="text-gradient-cyan">NestGame</span> Admin
                    </h1>
                    <p className="text-[hsl(220,10%,55%)] text-sm">
                        Đăng nhập vào bảng điều khiển quản trị
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card-strong rounded-2xl p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Error message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-[hsl(0,0%,75%)] mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,55%)]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@nestgame.com"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,20%)] rounded-xl text-white placeholder:text-[hsl(220,10%,40%)] focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-[hsl(0,0%,75%)] mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,55%)]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,20%)] rounded-xl text-white placeholder:text-[hsl(220,10%,40%)] focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,55%)] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#00d4ff] to-[#00f5d4] text-[hsl(220,20%,4%)] hover:brightness-110 hover:shadow-lg hover:shadow-[#00d4ff]/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang xác thực...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Đăng nhập Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-[hsl(220,15%,15%)]">
                        <div className="flex items-center justify-center gap-2 text-[hsl(220,10%,45%)] text-xs">
                            <Gamepad2 className="w-4 h-4" />
                            <span>NestGame Admin Panel • v1.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
