'use client';

import { Image as ImageIcon, Wand2, Search } from 'lucide-react';
import { RAWGImageFinder } from './RAWGImageFinder';
import { ImagePreview } from './ImagePreview';
import { stripRomExt } from '@/features/admin/utils/formUtils';

const inputCls = "w-full px-3 py-2.5 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors border";
const inputStyle = { background: '#1C2434', borderColor: '#2E3A47' };
const labelCls = "block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider";

export function GameMediaForm({ form, setForm, applyImageBaseUrl, applyRAWGImages }: any) {
    return (
        <div className="rounded-[10px] p-4 space-y-4" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
            <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" style={{ color: '#10B981' }} />
                Hình ảnh
            </h4>

            {/* RAWG Finder */}
            <div className="rounded-md p-3 space-y-2" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-2 mb-0.5">
                    <Search className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                    <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Tìm ảnh tự động từ RAWG Database</span>
                    <span className="text-[10px] text-[#637381]">(Chất lượng cao - Miễn phí)</span>
                </div>
                <RAWGImageFinder
                    defaultName={stripRomExt(form.fileName || form.name)}
                    onApply={applyRAWGImages}
                />
            </div>

            <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: '#2E3A47' }} />
                <span className="text-[11px] text-[#637381]">hoặc nhập tay</span>
                <div className="flex-1 h-px" style={{ background: '#2E3A47' }} />
            </div>

            {/* Base URL auto-derive */}
            <div>
                <label className={labelCls}>
                    <span className="flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                        URL gốc (tự động tạo 3 URL ảnh)
                    </span>
                </label>
                <div className="flex gap-2">
                    <input
                        value={form.imageBaseUrl}
                        onChange={e => applyImageBaseUrl(e.target.value)}
                        placeholder="https://example.com/images/game-name.jpg"
                        className={`${inputCls} flex-1`} style={inputStyle}
                    />
                    {form.imageBaseUrl && (
                        <button type="button" onClick={() => applyImageBaseUrl(form.imageBaseUrl)}
                            className="px-3 rounded-md text-white text-xs font-medium transition-colors flex-shrink-0"
                            style={{ background: '#3C50E0' }}>
                            Tạo lại
                        </button>
                    )}
                </div>
                <p className="text-[#637381] text-[11px] mt-1">
                    Nhập URL bất kỳ để tự tạo: <code className="text-[#A5B4CB]">.jpg</code> · <code className="text-[#A5B4CB]">s.jpg</code> · <code className="text-[#A5B4CB]">t.jpg</code>
                </p>
            </div>

            {/* 3 URL fields + preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { key: 'imageUrl', label: 'Image URL (Box Art)' },
                    { key: 'imageSnap', label: 'Image Snap (Screenshot)' },
                    { key: 'imageTitle', label: 'Image Title (Title Screen)' },
                ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                        <label className={labelCls}>{label}</label>
                        <input
                            value={(form as any)[key]}
                            onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
                            placeholder="https://..."
                            className={inputCls} style={inputStyle}
                        />
                        <ImagePreview url={(form as any)[key]} label={label} />
                    </div>
                ))}
            </div>
        </div>
    );
}
