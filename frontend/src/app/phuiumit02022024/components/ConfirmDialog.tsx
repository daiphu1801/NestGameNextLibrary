'use client';

import { X, AlertTriangle, Zap, Info } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Hủy',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const variantConfig = {
        danger: {
            Icon: AlertTriangle,
            iconBg: 'rgba(251,84,84,0.1)',
            iconColor: '#FB5454',
            confirmBg: '#FB5454',
            confirmHover: '#E04848',
            border: '#3B2A2A',
        },
        warning: {
            Icon: Zap,
            iconBg: 'rgba(245,158,11,0.1)',
            iconColor: '#F59E0B',
            confirmBg: '#F59E0B',
            confirmHover: '#D97706',
            border: '#3B3522',
        },
        info: {
            Icon: Info,
            iconBg: 'rgba(60,80,224,0.1)',
            iconColor: '#3C50E0',
            confirmBg: '#3C50E0',
            confirmHover: '#3545C4',
            border: '#2A2E3B',
        },
    };

    const v = variantConfig[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative w-full max-w-md rounded-[10px] border overflow-hidden" style={{ background: '#24303F', borderColor: '#2E3A47' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: v.iconBg }}>
                            <v.Icon className="w-5 h-5" style={{ color: v.iconColor }} />
                        </div>
                        <h3 className="text-base font-semibold text-white">{title}</h3>
                    </div>
                    <button onClick={onCancel} className="p-1.5 rounded-md hover:bg-[#333A48] text-[#A5B4CB] hover:text-white transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    <p className="text-sm text-[#A5B4CB] leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-5 pt-0">
                    <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-[#A5B4CB] hover:text-white bg-transparent border border-[#2E3A47] hover:border-[#3E4C5D] transition-all cursor-pointer">
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all active:scale-[0.97] cursor-pointer" style={{ background: v.confirmBg }}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
