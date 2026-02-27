'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, Users, Gamepad2, FolderTree, LogOut, Menu, X,
    ChevronLeft, ChevronDown, Search, Bell, Settings, MessageSquare, Clock, Star, Image as ImageIcon
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { ToastProvider } from './components/ToastProvider';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Người dùng', icon: Users },
    { href: '/admin/games', label: 'Games', icon: Gamepad2 },
    { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
    { href: '/admin/images', label: 'Ảnh Game', icon: ImageIcon },
    { href: '/admin/comments', label: 'Bình luận', icon: MessageSquare },
    { href: '/admin/ratings', label: 'Đánh giá', icon: Star },
    { href: '/admin/activity', label: 'Lịch sử', icon: Clock },
    { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [admin, setAdmin] = useState<any>(null);
    const [checked, setChecked] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

    // Sync search input when URL params change (e.g. navigating between pages)
    useEffect(() => {
        setSearchInput(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchInput.trim()) params.set('q', searchInput.trim());
        router.push(`${pathname}?${params.toString()}`);
    };

    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) { setChecked(true); return; }
        if (!adminService.isAuthenticated()) { router.replace('/admin/login'); return; }
        setAdmin(adminService.getCurrentAdmin());
        setChecked(true);
    }, [router, isLoginPage]);

    const handleLogout = async () => {
        await adminService.logout();
        router.replace('/admin/login');
    };

    if (isLoginPage) return <ToastProvider>{children}</ToastProvider>;

    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A222C' }}>
                <div className="w-8 h-8 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <ToastProvider>
            <div className="min-h-screen flex" style={{ background: '#1A222C' }}>
                {/* Mobile overlay */}
                {mobileSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
                )}

                {/* ═══ Sidebar ═══ */}
                <aside className={`
                fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col
                transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden
                ${sidebarOpen ? 'w-[280px]' : 'w-20'}
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `} style={{ background: '#1C2434' }}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 h-[70px] flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#3C50E0' }}>
                            <Gamepad2 className="w-4.5 h-4.5 text-white" />
                        </div>
                        {sidebarOpen && (
                            <span className="text-white font-bold text-xl tracking-tight whitespace-nowrap">
                                NestGame
                            </span>
                        )}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="ml-auto hidden lg:flex items-center justify-center w-7 h-7 rounded text-[#8A99AF] hover:text-white transition-colors cursor-pointer">
                            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <button onClick={() => setMobileSidebarOpen(false)}
                            className="ml-auto lg:hidden text-[#8A99AF] hover:text-white cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 py-4">
                        {sidebarOpen && (
                            <p className="text-[#8A99AF] text-[11px] font-semibold uppercase tracking-[0.08em] px-3 mb-3">
                                Menu
                            </p>
                        )}
                        <ul className="space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileSidebarOpen(false)}
                                            className={`
                                            group flex items-center gap-3 px-4 py-[10px] rounded-md text-sm font-medium transition-all duration-200
                                            ${isActive
                                                    ? 'bg-[#333A48] text-white'
                                                    : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                                                }
                                        `}
                                            title={!sidebarOpen ? item.label : undefined}
                                        >
                                            <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'text-[#8A99AF] group-hover:text-white'}`} />
                                            {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>


                </aside>

                {/* ═══ Main content ═══ */}
                <div className="flex-1 flex flex-col min-h-screen min-w-0">
                    {/* Header */}
                    <header className="sticky top-0 z-30 flex items-center justify-between h-[70px] px-4 lg:px-7 border-b" style={{ background: '#1C2434', borderColor: '#2E3A47' }}>
                        {/* Left: mobile toggle + search */}
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden text-[#8A99AF] hover:text-white cursor-pointer">
                                <Menu className="w-6 h-6" />
                            </button>
                            <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
                                <Search className="w-4 h-4 text-[#637381] flex-shrink-0" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Tìm kiếm..."
                                    className="bg-transparent text-sm text-white placeholder:text-[#637381] focus:outline-none w-full"
                                />
                                <button type="submit" className="px-4 py-1.5 rounded-md text-sm font-medium text-white transition-all cursor-pointer flex-shrink-0 hover:brightness-110 active:scale-95" style={{ background: '#3C50E0' }}>Tìm</button>
                            </form>
                        </div>

                        {/* Right: actions + user */}
                        <div className="flex items-center gap-3">
                            {/* Notification dropdown */}
                            <div className="relative">
                                <button onClick={async () => {
                                    setNotifOpen(!notifOpen);
                                    if (!notifOpen) {
                                        try { setNotifications(await adminService.getNotifications()); } catch { }
                                    }
                                }} className="relative w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer hover:text-white" style={{ borderColor: '#2E3A47', color: '#8A99AF' }}>
                                    <Bell className="w-[18px] h-[18px]" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                                </button>
                                {notifOpen && (
                                    <div className="absolute right-0 top-12 w-80 rounded-lg border shadow-xl overflow-hidden z-50" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                                        <div className="px-4 py-3 border-b font-semibold text-sm text-white" style={{ borderColor: '#2E3A47' }}>Thông báo</div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <p className="px-4 py-6 text-center text-sm text-[#636B7F]">Không có thông báo</p>
                                            ) : notifications.map((n: any, i: number) => (
                                                <div key={i} className="px-4 py-3 border-b hover:bg-[#1C2434]/50 transition-colors" style={{ borderColor: '#2E3A47' }}>
                                                    <p className="text-sm text-[#DEE4EE]">{n.message}</p>
                                                    <p className="text-xs text-[#636B7F] mt-1">{n.timestamp ? new Date(n.timestamp).toLocaleString('vi-VN') : ''}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Link href="/admin/settings" className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer hover:text-white" style={{ borderColor: '#2E3A47', color: '#8A99AF' }}>
                                <Settings className="w-[18px] h-[18px]" />
                            </Link>

                            {/* Divider */}
                            <div className="w-px h-8 mx-1" style={{ background: '#2E3A47' }} />

                            {/* User */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2.5 cursor-pointer"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-white text-sm font-medium leading-tight">{admin?.username || 'Admin'}</p>
                                        <p className="text-[#8A99AF] text-xs leading-tight">Quản trị viên</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden" style={{ background: '#3C50E0' }}>
                                        {admin?.username?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-[#8A99AF] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                        <div className="absolute right-0 top-14 w-48 rounded-lg border p-2 z-50 shadow-xl" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                                            <button onClick={handleLogout}
                                                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-[#DEE4EE] hover:bg-[#333A48] transition-colors cursor-pointer">
                                                <LogOut className="w-4 h-4" />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-4 lg:p-7">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A222C' }}>
                <div className="w-8 h-8 border-2 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}
