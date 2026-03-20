import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Gamepad2, FolderTree, MessageSquare, Star, Clock, Settings, Crown, Image as ImageIcon, ChevronLeft, X, Zap } from 'lucide-react';

export const NAV_ITEMS = [
    { href: '/phuiumit02022024', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/phuiumit02022024/users', label: 'Người dùng', icon: Users },
    { href: '/phuiumit02022024/games', label: 'Games', icon: Gamepad2 },
    { href: '/phuiumit02022024/flash-upload', label: 'Flash Upload', icon: Zap },
    { href: '/phuiumit02022024/featured-games', label: 'Game nổi bật', icon: Crown },
    { href: '/phuiumit02022024/game-month', label: 'Game Tháng', icon: Crown },
    { href: '/phuiumit02022024/categories', label: 'Danh mục', icon: FolderTree },
    { href: '/phuiumit02022024/images', label: 'Ảnh Game', icon: ImageIcon },
    { href: '/phuiumit02022024/comments', label: 'Bình luận', icon: MessageSquare },
    { href: '/phuiumit02022024/ratings', label: 'Đánh giá', icon: Star },
    { href: '/phuiumit02022024/activity', label: 'Lịch sử', icon: Clock },
    { href: '/phuiumit02022024/settings', label: 'Cài đặt', icon: Settings },
];

export interface AdminSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
    mobileSidebarOpen: boolean;
    setMobileSidebarOpen: (v: boolean) => void;
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
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
                        const isActive = pathname === item.href || (item.href !== '/phuiumit02022024' && pathname.startsWith(item.href));
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
    );
}
