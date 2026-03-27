'use client';

import { FolderOpen, Upload } from 'lucide-react';
import { RomDropZone } from './RomDropZone';

const REGIONS = ['', 'JP', 'US', 'EU', 'World', 'KR', 'AU', 'FR', 'DE', 'IT', 'SP'];
const SYSTEMS = [
    { id: 'nes', name: 'NES' },
    { id: 'snes', name: 'SNES' },
    { id: 'genesis', name: 'Sega Genesis' },
    { id: 'gba', name: 'Game Boy Advance' },
    { id: 'gb', name: 'Game Boy' },
    { id: 'gbc', name: 'Game Boy Color' },
    { id: 'arcade', name: 'Arcade' },
    { id: 'neogeo', name: 'Neo Geo' },
    { id: 'ps1', name: 'PlayStation 1' },
    { id: 'ps2', name: 'PlayStation 2' },
    { id: 'psp', name: 'PlayStation Portable' },
    { id: 'flash', name: 'Flash Game (.swf)' },
    { id: 'j2me', name: 'Java Mobile (.jar)' }
];

const inputCls = "w-full px-3 py-2.5 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50 transition-colors border";
const inputStyle = { background: '#1C2434', borderColor: '#2E3A47' };
const labelCls = "block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider";

export function GameGeneralInfoForm({ form, setForm, autoFillFromName, onRomUploaded, categories, isEditing }: any) {
    return (
        <div className="space-y-6">
            {/* ROM File Upload */}
            {!isEditing && (
                <div className="rounded-[10px] p-4 space-y-3" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <Upload className="w-4 h-4" style={{ color: '#3C50E0' }} />
                        <h4 className="text-white text-sm font-semibold">Upload ROM File</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(60,80,224,0.15)', color: '#6577F3' }}>Tự động điền</span>
                    </div>
                    <RomDropZone onUploaded={onRomUploaded} />
                </div>
            )}

            {/* Basic Info */}
            <div className="rounded-[10px] p-4 space-y-4" style={{ background: '#24303F', border: '1px solid #2E3A47' }}>
                <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" style={{ color: '#F59E0B' }} />
                    Thông tin cơ bản
                </h4>

                {/* Tên game */}
                <div>
                    <label className={labelCls}>Tên game *</label>
                    <input
                        value={form.name}
                        onChange={e => autoFillFromName(e.target.value, isEditing)}
                        required
                        placeholder="Ví dụ: Super Mario Bros"
                        className={inputCls} style={inputStyle}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* File Name */}
                    <div>
                        <label className={labelCls}>
                            File Name *
                            {form.fileName && <span className="ml-2 text-[#10B981] normal-case font-normal">✓ Đã điền</span>}
                        </label>
                        <input
                            value={form.fileName}
                            onChange={e => setForm((f: any) => ({ ...f, fileName: e.target.value }))}
                            required
                            placeholder="Ví dụ: Super Mario Bros (JU).nes"
                            className={inputCls} style={inputStyle}
                        />
                    </div>

                    {/* Path */}
                    <div>
                        <label className={labelCls}>
                            Path *
                            {form.path && <span className="ml-2 text-[#10B981] normal-case font-normal">✓ Đã điền</span>}
                        </label>
                        <input
                            value={form.path}
                            onChange={e => setForm((f: any) => ({ ...f, path: e.target.value }))}
                            required
                            placeholder="Nes ROMs Complete 1 Of 4/..."
                            className={inputCls} style={inputStyle}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Danh mục */}
                    <div>
                        <label className={labelCls}>Danh mục</label>
                        <select value={form.categoryId} onChange={e => setForm((f: any) => ({ ...f, categoryId: e.target.value }))}
                            className={inputCls} style={inputStyle}>
                            <option value="">— Chọn —</option>
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                        </select>
                    </div>

                    {/* System dropdown */}
                    <div>
                        <label className={labelCls}>Hệ máy (System)</label>
                        <select value={form.system} onChange={e => setForm((f: any) => ({ ...f, system: e.target.value }))}
                            className={inputCls} style={inputStyle}>
                            {SYSTEMS.map(sys => <option key={sys.id} value={sys.id}>{sys.name}</option>)}
                        </select>
                    </div>

                    {/* Region dropdown */}
                    <div>
                        <label className={labelCls}>Region</label>
                        <select value={form.region} onChange={e => setForm((f: any) => ({ ...f, region: e.target.value }))}
                            className={inputCls} style={inputStyle}>
                            {REGIONS.map(r => <option key={r} value={r}>{r || '— Chọn —'}</option>)}
                        </select>
                    </div>

                    {/* Năm */}
                    <div>
                        <label className={labelCls}>Năm</label>
                        <input type="number" min="1980" max="2030" value={form.year}
                            onChange={e => setForm((f: any) => ({ ...f, year: e.target.value }))}
                            placeholder="1985"
                            className={inputCls} style={inputStyle} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Rating */}
                    <div>
                        <label className={labelCls}>Rating (0—5)</label>
                        <input type="number" step="0.1" min="0" max="5" value={form.rating}
                            onChange={e => setForm((f: any) => ({ ...f, rating: e.target.value }))}
                            placeholder="4.5"
                            className={inputCls} style={inputStyle} />
                    </div>

                    {/* Featured */}
                    <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <div
                                onClick={() => setForm((f: any) => ({ ...f, isFeatured: !f.isFeatured }))}
                                className="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer flex-shrink-0"
                                style={{ background: form.isFeatured ? '#3C50E0' : '#2E3A47', width: 40, height: 22 }}
                            >
                                <div className="absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform"
                                    style={{ transform: form.isFeatured ? 'translateX(18px)' : 'translateX(0)' }}
                                />
                            </div>
                            <span className="text-white text-sm">Nổi bật (Featured)</span>
                        </label>
                    </div>
                </div>

                {/* Mô tả */}
                <div>
                    <label className={labelCls}>Mô tả</label>
                    <textarea value={form.description}
                        onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                        rows={3} placeholder="Viết mô tả ngắn về game..."
                        className={`${inputCls} resize-none`} style={inputStyle} />
                </div>
            </div>
        </div>
    );
}
