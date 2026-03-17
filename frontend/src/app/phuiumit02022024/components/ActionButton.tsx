'use client';

import { type LucideIcon } from 'lucide-react';

interface ActionButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'success' | 'warning' | 'primary';
    disabled?: boolean;
    active?: boolean;
}

const variantStyles = {
    default: 'text-[#A5B4CB] hover:text-[#3C50E0] hover:bg-[#3C50E0]/10 hover:border-[#3C50E0]/20',
    danger: 'text-[#A5B4CB] hover:text-[#FB5454] hover:bg-[#FB5454]/10 hover:border-[#FB5454]/20',
    success: 'text-[#A5B4CB] hover:text-[#10B981] hover:bg-[#10B981]/10 hover:border-[#10B981]/20',
    warning: 'text-[#A5B4CB] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 hover:border-[#F59E0B]/20',
    primary: 'text-[#A5B4CB] hover:text-[#3C50E0] hover:bg-[#3C50E0]/10 hover:border-[#3C50E0]/20',
};

const activeStyles = {
    default: 'text-[#3C50E0] bg-[#3C50E0]/10 border-[#3C50E0]/20',
    danger: 'text-[#FB5454] bg-[#FB5454]/10 border-[#FB5454]/20',
    success: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20',
    warning: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
    primary: 'text-[#3C50E0] bg-[#3C50E0]/10 border-[#3C50E0]/20',
};

export function ActionButton({
    icon: Icon,
    label,
    onClick,
    variant = 'default',
    disabled = false,
    active = false,
}: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                group/btn relative flex items-center gap-0 overflow-hidden
                p-2 rounded-md border border-transparent
                transition-all duration-300 ease-out cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed
                ${active ? activeStyles[variant] : variantStyles[variant]}
                hover:pr-3 hover:gap-1.5
            `}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 group-hover/btn:max-w-[80px] group-hover/btn:opacity-100 transition-all duration-300 ease-out">
                {label}
            </span>
        </button>
    );
}
