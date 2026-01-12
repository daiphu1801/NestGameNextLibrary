'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Heart, History, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface UserDropdownProps {
    user: {
        username: string;
        email: string;
        avatarUrl?: string;
    } | null;
    onLogin: () => void;
    onLogout: () => void;
}

export function UserDropdown({ user, onLogin, onLogout }: UserDropdownProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Not logged in - Show login button
    if (!user) {
        return (
            <button
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 hover:border-primary/50 transition-all hover:scale-105 active:scale-95"
            >
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                    {t('auth.login') || 'Đăng nhập'}
                </span>
            </button>
        );
    }

    // Logged in - Show user dropdown
    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
                    "hover:bg-white/5 border border-transparent",
                    isOpen && "bg-white/5 border-white/10"
                )}
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Username (hidden on mobile) */}
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                    {user.username}
                </span>

                <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 py-2 rounded-2xl glass-card-strong border border-white/10 shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/10">
                        <p className="font-semibold text-foreground truncate">{user.username}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <DropdownItem
                            href="/favorites"
                            icon={<Heart className="w-4 h-4" />}
                            onClick={() => setIsOpen(false)}
                        >
                            {t('nav.favorites') || 'Yêu thích'}
                        </DropdownItem>

                        <DropdownItem
                            href="/history"
                            icon={<History className="w-4 h-4" />}
                            onClick={() => setIsOpen(false)}
                        >
                            {t('user.history') || 'Lịch sử chơi'}
                        </DropdownItem>

                        <DropdownItem
                            href="/settings"
                            icon={<Settings className="w-4 h-4" />}
                            onClick={() => setIsOpen(false)}
                        >
                            {t('user.settings') || 'Cài đặt'}
                        </DropdownItem>
                    </div>

                    {/* Logout */}
                    <div className="pt-2 border-t border-white/10">
                        <button
                            onClick={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            {t('auth.logout') || 'Đăng xuất'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DropdownItem({
    href,
    icon,
    children,
    onClick
}: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-white/5 transition-colors"
        >
            <span className="text-muted-foreground">{icon}</span>
            {children}
        </Link>
    );
}
