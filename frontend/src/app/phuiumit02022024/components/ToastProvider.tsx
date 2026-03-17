'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    isLeaving?: boolean;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

const toastConfig = {
    success: { icon: CheckCircle2, bg: '#10B981', border: '#059669', label: 'Thành công' },
    error: { icon: XCircle, bg: '#FB5454', border: '#DC2626', label: 'Lỗi' },
    warning: { icon: AlertTriangle, bg: '#F59E0B', border: '#D97706', label: 'Cảnh báo' },
    info: { icon: Info, bg: '#3C50E0', border: '#3545C4', label: 'Thông báo' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => onRemove(toast.id), 4000);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [toast.id, onRemove]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-sm max-w-sm w-full transition-all duration-300 ${toast.isLeaving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
            style={{
                background: 'rgba(36, 48, 63, 0.95)',
                borderColor: '#2E3A47',
                animation: toast.isLeaving ? undefined : 'slideInRight 0.3s ease-out',
            }}
        >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${config.bg}20` }}>
                <Icon className="w-4 h-4" style={{ color: config.bg }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: config.bg }}>{config.label}</p>
                <p className="text-sm text-[#DEE4EE] leading-snug truncate">{toast.message}</p>
            </div>
            <button onClick={() => onRemove(toast.id)} className="p-1 rounded hover:bg-[#333A48] text-[#8A99AF] hover:text-white transition-colors cursor-pointer flex-shrink-0">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, isLeaving: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
    }, []);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts(prev => [...prev, { id, type, message }]);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onRemove={removeToast} />
                    </div>
                ))}
            </div>
            <style jsx global>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </ToastContext.Provider>
    );
}
