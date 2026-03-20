'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { stripRomExt } from '@/features/admin/utils/formUtils';

interface RAWGFinderProps {
    defaultName?: string;
    onApply: (imageUrl: string, imageSnap: string, imageTitle: string) => void;
}

export function RAWGImageFinder({ defaultName = '', onApply }: RAWGFinderProps) {
    const [query, setQuery] = useState(defaultName);
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [selectedIdx, setSelectedIdx] = useState<number>(0);

    useEffect(() => {
        if (defaultName && defaultName !== query) setQuery(defaultName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultName]);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setSearching(true);
        setError('');
        setResults([]);

        try {
            const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
            if (!apiKey) {
                throw new Error('Vui lòng thêm NEXT_PUBLIC_RAWG_API_KEY vào file .env');
            }

            // Clean query to improve search
            const cleanQuery = stripRomExt(query).replace(/\(.*\)/g, '').trim();

            // platforms: 49 (NES), 79 (SNES), 167 (Genesis), 24 (GBA), 43 (GBC), 26 (Game Boy)
            const classicPlatforms = "49,79,167,24,43,26";
            const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(cleanQuery)}&key=${apiKey}&page_size=5&platforms=${classicPlatforms}`);
            if (!res.ok) throw new Error('Lỗi gọi API RAWG');

            const data = await res.json();
            if (data.results && data.results.length > 0) {
                setResults(data.results);
                setSelectedIdx(0);
            } else {
                setError('Không tìm thấy game nào');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi tìm kiếm');
        } finally {
            setSearching(false);
        }
    };

    const handleApply = () => {
        if (results.length === 0) return;
        const game = results[selectedIdx];

        // Use background_image as boxart/cover
        const boxart = game.background_image || '';

        // Get screenshots (avoid background_image itself if possible)
        const screenshots = game.short_screenshots?.filter((s: any) => s.image !== boxart) || [];

        // Use first screenshot as snap, second as title (or fallback to background)
        const snap = screenshots.length > 0 ? screenshots[0].image : boxart;
        const title = screenshots.length > 1 ? screenshots[1].image : snap;

        onApply(boxart, snap, title);
    };

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#637381]" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Ví dụ: Super Mario Bros"
                        className="w-full pl-8 pr-3 py-2 rounded-md text-white text-sm border focus:outline-none focus:ring-1 focus:ring-[#10B981]/50 transition-colors"
                        style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={!query.trim() || searching}
                    className="flex items-center gap-1.5 px-4 rounded-md text-white text-sm font-semibold disabled:opacity-50 transition-all hover:brightness-105 flex-shrink-0 cursor-pointer"
                    style={{ background: '#10B981' }}
                >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Tìm RAWG
                </button>
            </div>

            {error && <p className="text-[#FB5454] text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}

            {/* Preview Results */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs text-[#A5B4CB]">Chọn kết quả chuẩn nhất ({results.length} games):</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {results.map((game, idx) => (
                            <div
                                key={game.id}
                                onClick={() => setSelectedIdx(idx)}
                                className="flex-shrink-0 w-40 cursor-pointer rounded-lg overflow-hidden transition-all group relative"
                                style={{
                                    border: `2px solid ${idx === selectedIdx ? '#10B981' : '#2E3A47'}`,
                                    background: '#1C2434',
                                    opacity: idx === selectedIdx ? 1 : 0.7
                                }}
                            >
                                <div className="aspect-video w-full relative">
                                    {game.background_image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={game.background_image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-[#637381]" /></div>
                                    )}
                                    {idx === selectedIdx && (
                                        <div className="absolute top-1 right-1 bg-[#10B981] rounded-full p-0.5 shadow-md">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-white text-xs font-semibold truncate" title={game.name}>{game.name}</p>
                                    <p className="text-[#A5B4CB] text-[10px] truncate">{game.released?.split('-')[0] || ''} • RATING: {game.rating || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Apply button */}
                    <button
                        type="button"
                        onClick={handleApply}
                        className="w-full py-2 rounded-md text-white text-sm font-semibold transition-all hover:brightness-105 cursor-pointer flex items-center justify-center gap-2"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981' }}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Áp dụng BoxArt & Screenshots từ RAWG
                    </button>
                </div>
            )}
        </div>
    );
}
