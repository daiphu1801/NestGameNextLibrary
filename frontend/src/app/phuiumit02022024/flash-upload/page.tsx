'use client';

import { Zap, Upload, FolderOpen, FileIcon, Trash2, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useFlashUpload, formatFileSize } from '@/features/admin/hooks/useFlashUpload';

export default function FlashUploadPage() {
    const {
        gameName, setGameName,
        files, entryFile, setEntryFile,
        uploading, progress, results, error,
        inputRef,
        swfFiles, totalSize,
        handleFolderSelect, handleDrop, handleUpload, clearFiles,
    } = useFlashUpload();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EA580C, #E11D48)' }}>
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Flash Game Upload</h1>
                    <p className="text-sm text-[#8A99AF]">Upload cả thư mục game Flash (bao gồm assets, nhân vật, config...)</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Upload Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Game Name Input */}
                    <div className="rounded-xl p-6" style={{ background: '#1C2434' }}>
                        <label className="block text-sm font-medium text-[#DEE4EE] mb-2">Tên Game</label>
                        <input
                            type="text"
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            placeholder="VD: Bleach vs Naruto 3.3"
                            className="w-full px-4 py-3 rounded-lg text-white placeholder-[#636D80] focus:outline-none focus:ring-2 focus:ring-[#3C50E0]/50 transition-all"
                            style={{ background: '#24303F', border: '1px solid #333A48' }}
                        />
                    </div>

                    {/* Drop Zone */}
                    <div
                        className="rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-orange-500/50 group min-h-[200px]"
                        style={{ background: '#1C2434', border: '2px dashed #333A48' }}
                        onClick={() => inputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFolderSelect}
                            {...{ webkitdirectory: 'true', directory: 'true' } as any}
                            multiple
                        />
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ background: '#24303F' }}>
                            <FolderOpen className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-[#DEE4EE] font-medium mb-1">Kéo thả thư mục game vào đây</p>
                        <p className="text-[#636D80] text-sm">hoặc click để chọn thư mục</p>
                        <p className="text-[#636D80] text-xs mt-2">Hỗ trợ: .swf, .xml, .json, .png, .jpg, .mp3, .wav, .dat...</p>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="rounded-xl overflow-hidden" style={{ background: '#1C2434' }}>
                            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #333A48' }}>
                                <div className="flex items-center gap-3">
                                    <span className="text-[#DEE4EE] font-medium">{files.length} files</span>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: '#24303F', color: '#8A99AF' }}>{formatFileSize(totalSize)}</span>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: 'rgba(234,88,12,0.15)', color: '#FB923C' }}>{swfFiles.length} SWF</span>
                                </div>
                                <button onClick={clearFiles} className="text-[#8A99AF] hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {files.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ borderBottom: '1px solid #2A3441' }}>
                                        <FileIcon className={`w-4 h-4 flex-shrink-0 ${entry.isSwf ? 'text-orange-500' : 'text-[#636D80]'}`} />
                                        <span className={`flex-1 truncate ${entry.isSwf ? 'text-orange-300' : 'text-[#8A99AF]'}`}>{entry.relativePath}</span>
                                        <span className="text-[#636D80] text-xs flex-shrink-0">{formatFileSize(entry.size)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Settings & Upload */}
                <div className="space-y-6">
                    {/* Entry SWF Selector */}
                    {swfFiles.length > 0 && (
                        <div className="rounded-xl p-5" style={{ background: '#1C2434' }}>
                            <label className="block text-sm font-medium text-[#DEE4EE] mb-3">
                                <Zap className="w-4 h-4 inline mr-1 text-orange-500" />
                                File .swf chính (Entry Point)
                            </label>
                            <select
                                value={entryFile}
                                onChange={(e) => setEntryFile(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                style={{ background: '#24303F', border: '1px solid #333A48' }}
                            >
                                {swfFiles.map((f, i) => (
                                    <option key={i} value={f.relativePath}>{f.relativePath} ({formatFileSize(f.size)})</option>
                                ))}
                            </select>
                            <p className="text-[#636D80] text-xs mt-2">Đây là file .swf mà Ruffle sẽ tải đầu tiên</p>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || files.length === 0 || !gameName.trim()}
                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
                        style={{ background: uploading ? '#333A48' : 'linear-gradient(135deg, #EA580C, #E11D48)' }}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang upload... {progress}%
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Upload {files.length} files
                            </>
                        )}
                    </button>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="rounded-xl p-4" style={{ background: '#1C2434' }}>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#24303F' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #EA580C, #E11D48)' }}
                                />
                            </div>
                            <p className="text-center text-[#8A99AF] text-xs mt-2">{progress}% — Đang upload lên server...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Results */}
                    {results && (
                        <div className="rounded-xl p-5 space-y-4" style={{ background: '#1C2434' }}>
                            <div className="flex items-center gap-2">
                                {results.errorCount === 0 ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                )}
                                <span className="text-white font-bold">Upload hoàn tất!</span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#8A99AF]">Thành công:</span>
                                    <span className="text-green-400 font-bold">{results.successCount}/{results.totalFiles}</span>
                                </div>
                                {results.errorCount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-[#8A99AF]">Lỗi:</span>
                                        <span className="text-red-400 font-bold">{results.errorCount}</span>
                                    </div>
                                )}
                            </div>

                            {results.mainSwfUrl && (
                                <div className="pt-3" style={{ borderTop: '1px solid #333A48' }}>
                                    <p className="text-xs text-[#8A99AF] mb-1">URL file .swf chính:</p>
                                    <code className="block text-xs text-orange-300 break-all p-2 rounded" style={{ background: '#24303F' }}>
                                        {results.mainSwfUrl}
                                    </code>
                                    <p className="text-xs text-[#636D80] mt-2">
                                        → Copy URL này và paste vào trường &quot;ROM Path&quot; khi tạo game Flash trong trang Games.
                                    </p>
                                </div>
                            )}

                            {results.results.filter(r => r.status === 'error').length > 0 && (
                                <div className="pt-3 space-y-1" style={{ borderTop: '1px solid #333A48' }}>
                                    <p className="text-xs text-red-400 font-medium">Files lỗi:</p>
                                    {results.results.filter(r => r.status === 'error').map((r, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                                            <span className="text-[#8A99AF] truncate">{r.path}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Help Card */}
                    <div className="rounded-xl p-5" style={{ background: '#1C2434' }}>
                        <h3 className="text-sm font-bold text-[#DEE4EE] mb-3">📖 Hướng dẫn chi tiết tạo game</h3>
                        <ol className="space-y-2 text-xs text-[#8A99AF] list-decimal list-inside">
                            <li>Chọn thư mục chứa game (phải bao gồm file .swf và các file liên quan)</li>
                            <li>Nhập ID/Tên ngắn (VD: <code className="text-orange-400">bvn33</code>) và chọn file .swf chính để chạy</li>
                            <li>Nhấn Upload — toàn bộ cấu trúc thư mục sẽ được giữ nguyên</li>
                            <li>Khi upload xong, copy <strong className="text-orange-300">URL file .swf chính</strong></li>
                            <li>Vào trang <strong>Admin → Games → Thêm Game mới</strong>:
                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-[#636D80]">
                                    <li>System: Chọn <strong>Flash Web</strong></li>
                                    <li>ROM Path: <strong className="text-white">Dán URL file .swf vừa copy vào đây</strong></li>
                                    <li>Điền các thông tin khác (Tên, Ảnh...) và Lưu</li>
                                </ul>
                            </li>
                            <li>Ra ngoài trang chủ, giờ bạn có thể click vào card game để chơi ngay! 🎮</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
