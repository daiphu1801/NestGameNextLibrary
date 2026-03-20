'use client';

import { useState, useEffect } from 'react';
import { ImageIcon, Loader2, AlertCircle } from 'lucide-react';

export function ImagePreview({ url, label }: { url: string; label: string }) {
    const [ok, setOk] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url) { setOk(false); return; }
        setLoading(true);
        const img = new window.Image();
        img.onload = () => { setOk(true); setLoading(false); };
        img.onerror = () => { setOk(false); setLoading(false); };
        img.src = url;
    }, [url]);

    if (!url) return (
        <div className="aspect-video rounded-md flex flex-col items-center justify-center gap-1" style={{ background: '#1C2434', border: '1px dashed #2E3A47' }}>
            <ImageIcon className="w-5 h-5 text-[#637381]" />
            <span className="text-[#637381] text-[10px]">{label}</span>
        </div>
    );

    return (
        <div className="aspect-video rounded-md overflow-hidden relative" style={{ border: '1px solid #2E3A47' }}>
            {loading && <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#1C2434' }}><Loader2 className="w-4 h-4 animate-spin text-[#3C50E0]" /></div>}
            {ok ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={label} className="w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: '#1C2434' }}>
                    <AlertCircle className="w-4 h-4 text-[#FB5454]" />
                    <span className="text-[#FB5454] text-[10px]">Không tải được</span>
                </div>
            )}
        </div>
    );
}
