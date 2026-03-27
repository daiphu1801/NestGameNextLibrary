'use client';

import { useState, useRef } from 'react';
import { Loader2, CheckCircle2, FileUp, AlertCircle } from 'lucide-react';
import { adminService } from '@/services/adminService';

const ROM_FOLDERS = [
    'Nes ROMs Complete 1 Of 4',
    'Nes ROMs Complete 2 Of 4',
    'Nes ROMs Complete 3 Of 4',
    'Nes ROMs Complete 4 Of 4',
];

function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface RomDropZoneProps {
    onUploaded: (fileName: string, path: string) => void;
}

export function RomDropZone({ onUploaded }: RomDropZoneProps) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState<{ fileName: string; path: string; sizeBytes: number; mode?: string } | null>(null);
    const [error, setError] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(ROM_FOLDERS[0]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['nes', 'sfc', 'smc', 'gba', 'md', 'gen', 'bin', 'zip', 'swf', 'jar', 'jad', 'iso', 'cso', 'chd'].includes(ext || '')) {
            setError('Chỉ hỗ trợ file .nes, .sfc, .gba, .md, .zip, .swf, .jar, .jad, .iso, .cso, .chd');
            return;
        }
        setError('');
        setUploading(true);
        try {
            const result = await adminService.uploadRom(file, selectedFolder);
            setUploaded(result as any);
            onUploaded(result.fileName, result.path);
        } catch (err: any) {
            setError(err.message || 'Upload thất bại');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const isCloudinaryMode = uploaded?.mode === 'cloudinary';

    return (
        <div className="space-y-3">
            {/* Folder selector — only show for local mode */}
            {!isCloudinaryMode && !uploaded && (
                <div>
                    <label className="block text-xs font-medium text-[#A5B4CB] mb-1.5 uppercase tracking-wider">Thư mục đích (Local)</label>
                    <select
                        value={selectedFolder}
                        onChange={e => setSelectedFolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-md text-white text-sm border focus:outline-none focus:ring-1 focus:ring-[#3C50E0]/50"
                        style={{ background: '#1C2434', borderColor: '#2E3A47' }}
                    >
                        {ROM_FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            )}

            {/* Drop zone */}
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className="relative rounded-md p-6 text-center cursor-pointer transition-all"
                style={{
                    background: dragging ? 'rgba(60,80,224,0.08)' : '#1C2434',
                    border: `2px dashed ${dragging ? '#3C50E0' : uploaded ? '#10B981' : '#2E3A47'}`,
                }}
            >
                <input ref={inputRef} type="file" accept=".nes,.zip,.sfc,.smc,.gba,.md,.gen,.bin,.swf,.jar,.jad,.iso,.cso,.chd" className="hidden" onChange={onInputChange} />

                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#3C50E0' }} />
                        <span className="text-[#A5B4CB] text-sm">Đang upload...</span>
                    </div>
                ) : uploaded ? (
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
                        <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium">{uploaded.fileName}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={uploaded.mode === 'cloudinary'
                                ? { background: 'rgba(16,185,129,0.15)', color: '#10B981' }
                                : { background: 'rgba(60,80,224,0.15)', color: '#6577F3' }}>
                                {uploaded.mode === 'cloudinary' ? '☁️ Cloudinary' : '💾 Local'}
                            </span>
                        </div>
                        <p className="text-[#637381] text-xs max-w-xs truncate">{fmtSize(uploaded.sizeBytes)} · {uploaded.path}</p>
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setUploaded(null); onUploaded('', ''); }}
                            className="text-xs text-[#A5B4CB] hover:text-white underline mt-1"
                        >
                            Đổi file khác
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(60,80,224,0.1)' }}>
                            <FileUp className="w-6 h-6" style={{ color: '#3C50E0' }} />
                        </div>
                        <p className="text-white text-sm font-medium">Kéo thả hoặc click để chọn ROM / Game web / Java</p>
                        <p className="text-[#637381] text-xs">Hỗ trợ .nes · .sfc · .gba · .md · .zip · .swf · .jar · .iso · .cso</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-[#FB5454] text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{error}
                </p>
            )}
        </div>
    );
}
