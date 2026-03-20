'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { ToastProvider } from './components/ToastProvider';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [admin, setAdmin] = useState<any>(null);
    const [checked, setChecked] = useState(false);

    const isLoginPage = pathname === '/phuiumit02022024/login';

    useEffect(() => {
        if (isLoginPage) { setChecked(true); return; }
        if (!adminService.isAuthenticated()) { router.replace('/phuiumit02022024/login'); return; }
        setAdmin(adminService.getCurrentAdmin());
        setChecked(true);
    }, [router, isLoginPage]);

    const handleLogout = async () => {
        await adminService.logout();
        router.replace('/phuiumit02022024/login');
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

                {/* Sidebar Component */}
                <AdminSidebar 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    mobileSidebarOpen={mobileSidebarOpen}
                    setMobileSidebarOpen={setMobileSidebarOpen}
                />

                {/* Main content */}
                <div className="flex-1 flex flex-col min-h-screen min-w-0">
                    {/* Header Component */}
                    <AdminHeader 
                        setMobileSidebarOpen={setMobileSidebarOpen}
                        admin={admin}
                        handleLogout={handleLogout}
                    />

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
