'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { WelcomeBanner, StatCards, DashboardCharts, DashboardRanks } from '@/components/admin/dashboard/DashboardWidgets';

interface Stats {
    totalUsers: number;
    totalGames: number;
    totalCategories: number;
    totalPlays: number;
    newUsersThisMonth: number;
    activeUsers: number;
    topGames: any[];
    recentUsers: any[];
}

const generateTrendData = (total: number) => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const base = Math.max(1, Math.floor(total / 12));
    return months.map((m, i) => ({
        month: m,
        users: Math.floor(base * (0.4 + Math.random() * 0.8) + (i * base * 0.15)),
        plays: Math.floor(base * 2 * (0.3 + Math.random() * 1.0) + (i * base * 0.2)),
    }));
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadStats(); }, []);

    const loadStats = async () => {
        try { setStats(await adminService.getDashboardStats()); }
        catch (err) { console.error('Failed to load stats:', err); }
        finally { setLoading(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const trendData = generateTrendData(stats?.totalUsers || 50);

    const topGamesChart = (stats?.topGames || []).slice(0, 7).map((g: any) => ({
        name: g.name?.length > 12 ? g.name.slice(0, 12) + '…' : g.name,
        plays: g.playCount || 0,
    }));

    const maxPlays = Math.max(...(stats?.topGames || []).slice(0, 5).map((g: any) => g.playCount || 0), 1);

    return (
        <div className="space-y-6">
            <WelcomeBanner />
            <StatCards stats={stats} />
            <DashboardCharts trendData={trendData} topGamesChart={topGamesChart} />
            <DashboardRanks stats={stats} maxPlays={maxPlays} />
        </div>
    );
}
