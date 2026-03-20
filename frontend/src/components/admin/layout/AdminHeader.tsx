'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Menu, Search, Bell, Settings, ChevronDown, LogOut } from 'lucide-react';
import { adminService } from '@/services/adminService';

export interface AdminHeaderProps {
    setMobileSidebarOpen: (v: boolean) => void;
    admin: any;
    handleLogout: () => void;
}

export function AdminHeader({ setMobileSidebarOpen, admin, handleLogout }: AdminHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        setSearchInput(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchInput.trim()) params.set('q', searchInput.trim());
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
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
                            <div className="max-h-72 overflow-y-auto w-full max-w-full">
                                {notifications.length === 0 ? (
                                    <p className="px-4 py-6 text-center text-sm text-[#636B7F]">Không có thông báo</p>
                                ) : notifications.map((n: any, i: number) => (
                                    <div key={i} className="px-4 py-3 border-b hover:bg-[#1C2434]/50 transition-colors w-full" style={{ borderColor: '#2E3A47' }}>
                                        <p className="text-sm text-[#DEE4EE] break-words whitespace-normal leading-relaxed">{n.message}</p>
                                        <p className="text-xs text-[#636B7F] mt-1">{n.timestamp ? new Date(n.timestamp).toLocaleString('vi-VN') : ''}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <Link href="/phuiumit02022024/settings" className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer hover:text-white" style={{ borderColor: '#2E3A47', color: '#8A99AF' }}>
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
    );
}
