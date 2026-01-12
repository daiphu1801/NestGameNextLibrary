'use client';

import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

export function MobileWarning() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if mobile device
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768;
            setIsVisible(isMobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isVisible) return null;

    const message = "🎮 Trải nghiệm tốt nhất trên PC/Laptop với bàn phím • Best experience on PC/Laptop with keyboard 🎮";

    return (
        <div className="w-full bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 border-b border-amber-500/20 overflow-hidden">
            <div className="flex items-center h-8">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
                    {/* Repeat message multiple times for seamless loop */}
                    {[...Array(4)].map((_, i) => (
                        <span key={i} className="flex items-center gap-2 text-xs text-amber-200/80 font-medium">
                            <Monitor className="w-3.5 h-3.5 text-amber-400" />
                            {message}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
