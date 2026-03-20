'use client';
import Link from 'next/link';
import {
    Users, Gamepad2, FolderTree, TrendingUp, UserPlus, Activity,
    Crown, Clock, BarChart3, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Chào buổi sáng', emoji: '☀️' };
    if (h < 18) return { text: 'Chào buổi chiều', emoji: '🌤️' };
    return { text: 'Chào buổi tối', emoji: '🌙' };
};

export const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg px-3.5 py-2.5 shadow-lg border text-sm" style={{ background: '#1C2434', borderColor: '#2E3A47' }}>
            <p className="text-[#8A99AF] text-xs mb-1 font-medium">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-white text-sm font-semibold">{entry.value?.toLocaleString()}</span>
                    <span className="text-[#8A99AF] text-xs">{entry.name}</span>
                </div>
            ))}
        </div>
    );
};

export function WelcomeBanner() {
    const greeting = getGreeting();
    const admin = adminService.getCurrentAdmin();
    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return (
        <div className="rounded-[10px] p-6 border relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1C2434 0%, #24303F 50%, #1C2434 100%)', borderColor: '#2E3A47' }}>
            {/* Decorative gradient orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #3C50E0, transparent 70%)', transform: 'translate(30%, -40%)' }} />
            <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)', transform: 'translate(-50%, 40%)' }} />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {greeting.emoji} {greeting.text}, <span style={{ color: '#3C50E0' }}>{admin?.username || 'Admin'}</span>!
                    </h2>
                    <p className="text-[#A5B4CB] text-sm">{today}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/phuiumit02022024/games" className="flex items-center gap-2 px-4 py-2.5 rounded-md text-white text-sm font-medium hover:brightness-110 transition-all" style={{ background: '#3C50E0' }}>
                        <Gamepad2 className="w-4 h-4" /> Quản lý Games
                    </Link>
                    <Link href="/phuiumit02022024/activity" className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[#A5B4CB] text-sm font-medium border hover:text-white hover:border-[#3C50E0]/50 transition-all" style={{ borderColor: '#2E3A47' }}>
                        <Activity className="w-4 h-4" /> Lịch sử
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function StatCards({ stats }: { stats: any }) {
    const statCards = [
        { label: 'Tổng người dùng', value: stats?.totalUsers || 0, icon: Eye, change: '0.43%', up: true, iconBg: '#EFF2FF', iconColor: '#3C50E0' },
        { label: 'Tổng Games', value: stats?.totalGames || 0, icon: Gamepad2, change: '4.35%', up: true, iconBg: '#FEF5ED', iconColor: '#F59E0B' },
        { label: 'Danh mục', value: stats?.totalCategories || 0, icon: FolderTree, change: '2.59%', up: true, iconBg: '#ECFDF5', iconColor: '#10B981' },
        { label: 'Tổng lượt chơi', value: stats?.totalPlays || 0, icon: TrendingUp, change: '0.95%', up: true, iconBg: '#EFF2FF', iconColor: '#3C50E0' },
        { label: 'User mới (tháng)', value: stats?.newUsersThisMonth || 0, icon: UserPlus, change: '8%', up: true, iconBg: '#FFF4DE', iconColor: '#F59E0B' },
        { label: 'Đang hoạt động', value: stats?.activeUsers || 0, icon: Activity, change: '3%', up: true, iconBg: '#ECFDF5', iconColor: '#10B981' },
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {statCards.map((card, i) => (
                <div key={i} className="rounded-[10px] p-5 border" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                    <div className="flex items-center justify-center w-11 h-11 rounded-full mb-4" style={{ background: card.iconBg }}>
                        <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h4 className="text-[28px] font-bold text-white leading-tight mb-0.5">{card.value.toLocaleString()}</h4>
                            <p className="text-sm text-[#A5B4CB]">{card.label}</p>
                        </div>
                        <span className={`flex items-center gap-0.5 text-sm font-medium ${card.up ? 'text-[#10B981]' : 'text-[#FB5454]'}`}>
                            {card.change}
                            {card.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DashboardCharts({ trendData, topGamesChart }: { trendData: any; topGamesChart: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Area Chart */}
            <div className="lg:col-span-8 rounded-[10px] border p-5" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div>
                        <h3 className="text-white font-semibold text-base">Xu hướng tăng trưởng</h3>
                        <p className="text-[#A5B4CB] text-xs mt-0.5">Người dùng & lượt chơi theo tháng</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-[3px] rounded-full bg-[#3C50E0]" />
                            <span className="text-[#A5B4CB] text-xs">Người dùng</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-[3px] rounded-full bg-[#80CAEE]" />
                            <span className="text-[#A5B4CB] text-xs">Lượt chơi</span>
                        </div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3C50E0" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#3C50E0" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#80CAEE" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#80CAEE" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2E3A47" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#A5B4CB', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A5B4CB', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="users" name="Người dùng" stroke="#3C50E0" strokeWidth={2} fill="url(#gradBlue)" dot={false} activeDot={{ r: 4, fill: '#3C50E0', strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="plays" name="Lượt chơi" stroke="#80CAEE" strokeWidth={2} fill="url(#gradCyan)" dot={false} activeDot={{ r: 4, fill: '#80CAEE', strokeWidth: 0 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="lg:col-span-4 rounded-[10px] border p-5" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-semibold text-base">Phân bố danh mục</h3>
                    <span className="text-[#A5B4CB] text-xs">Theo lượt chơi</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topGamesChart.length ? topGamesChart : [{ name: 'N/A', plays: 0 }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2E3A47" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A5B4CB', fontSize: 10 }} angle={-20} textAnchor="end" />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A5B4CB', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="plays" name="Lượt chơi" radius={[4, 4, 0, 0]} fill="#3C50E0" maxBarSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function DashboardRanks({ stats, maxPlays }: { stats: any; maxPlays: number }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Top Games */}
            <div className="rounded-[10px] border p-6" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#EFF2FF' }}>
                        <Crown className="w-4.5 h-4.5" style={{ color: '#3C50E0' }} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Top Games</h3>
                        <p className="text-[#A5B4CB] text-xs">Theo lượt chơi</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {stats?.topGames?.length ? stats.topGames.slice(0, 5).map((game: any, i: number) => {
                        const pct = maxPlays > 0 ? ((game.playCount || 0) / maxPlays) * 100 : 0;
                        const rankBg = ['#F59E0B', '#A5B4CB', '#CD7F32', '#3C50E0', '#6577F3'];
                        return (
                            <div key={game.id || i}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ background: rankBg[i] || rankBg[4] }}>
                                            {i + 1}
                                        </span>
                                        <span className="text-white text-sm font-medium truncate max-w-[200px]">{game.name}</span>
                                    </div>
                                    <span className="text-[#3C50E0] text-sm font-bold tabular-nums">{(game.playCount || 0).toLocaleString()}</span>
                                </div>
                                <div className="w-full h-[5px] rounded-full overflow-hidden" style={{ background: '#1C2434' }}>
                                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: '#3C50E0' }} />
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-8">
                            <BarChart3 className="w-10 h-10 mx-auto mb-2" style={{ color: '#2E3A47' }} />
                            <p className="text-[#A5B4CB] text-sm">Chưa có dữ liệu</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Users */}
            <div className="rounded-[10px] border p-6" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#EFF2FF' }}>
                        <Clock className="w-4.5 h-4.5" style={{ color: '#3C50E0' }} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Người dùng mới</h3>
                        <p className="text-[#A5B4CB] text-xs">Đăng ký gần đây</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {stats?.recentUsers?.length ? stats.recentUsers.slice(0, 6).map((user: any) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[#2E3A47]/50 cursor-default">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#3C50E0' }}>
                                {user.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user.username}</p>
                                <p className="text-[#A5B4CB] text-xs truncate">{user.email}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wide ${user.role === 'ADMIN'
                                ? 'text-[#FB5454]'
                                : 'text-[#3C50E0]'
                                }`} style={{ background: user.role === 'ADMIN' ? 'rgba(251,84,84,0.1)' : 'rgba(60,80,224,0.1)' }}>
                                {user.role}
                            </span>
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <Users className="w-10 h-10 mx-auto mb-2" style={{ color: '#2E3A47' }} />
                            <p className="text-[#A5B4CB] text-sm">Chưa có dữ liệu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
