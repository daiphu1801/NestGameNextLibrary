import { useState, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FileEntry {
    file: File;
    relativePath: string;
    size: number;
    isSwf: boolean;
}

export interface UploadResult {
    path: string;
    size: number;
    status: 'ok' | 'error';
    error?: string;
}

export interface FlashUploadResults {
    mainSwfUrl: string;
    totalFiles: number;
    successCount: number;
    errorCount: number;
    results: UploadResult[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SKIP_EXTENSIONS = ['.exe', '.bat', '.cmd', '.url', '.lnk', '.log', '.sav'];
const SKIP_DIRS = ['meta-inf/', 'adobe air/'];
const LAUNCHER_NAMES = ['launch.swf', 'main.swf', 'game.swf', 'index.swf'];
const BATCH_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shouldSkipFile(path: string): boolean {
    const lower = path.toLowerCase();
    if (SKIP_EXTENSIONS.some(ext => lower.endsWith(ext))) return true;
    if (SKIP_DIRS.some(dir => lower.startsWith(dir))) return true;
    return false;
}

function detectEntrySwf(entries: FileEntry[]): string {
    const swfFiles = entries.filter(e => e.isSwf);
    if (swfFiles.length === 0) return '';
    // 1. Known launcher names
    const launcher = swfFiles.find(f => LAUNCHER_NAMES.includes(f.relativePath.toLowerCase()));
    if (launcher) return launcher.relativePath;
    // 2. Largest SWF in root (no subdirectory)
    const rootSwfs = swfFiles.filter(f => !f.relativePath.includes('/'));
    if (rootSwfs.length > 0) {
        return rootSwfs.sort((a, b) => b.size - a.size)[0].relativePath;
    }
    return swfFiles[0].relativePath;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFlashUpload() {
    const [gameName, setGameName] = useState('');
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [entryFile, setEntryFile] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<FlashUploadResults | null>(null);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // ── Process raw file list into FileEntry[] ────────────────────────────────
    const processFiles = useCallback((entries: FileEntry[], folderName?: string) => {
        setFiles(entries);
        setError('');
        setResults(null);
        setEntryFile(detectEntrySwf(entries));
        if (!gameName && folderName) setGameName(folderName);
    }, [gameName]);

    // ── Handle <input webkitdirectory> change ─────────────────────────────────
    const handleFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const entries: FileEntry[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const relativePath = file.webkitRelativePath || file.name;
            const parts = relativePath.split('/');
            const innerPath = parts.length > 1 ? parts.slice(1).join('/') : parts[0];
            if (shouldSkipFile(innerPath)) continue;
            entries.push({ file, relativePath: innerPath, size: file.size, isSwf: innerPath.toLowerCase().endsWith('.swf') });
        }

        const folderName = fileList[0]?.webkitRelativePath?.split('/')[0];
        processFiles(entries, folderName);
    }, [processFiles]);

    // ── Handle drag-and-drop ──────────────────────────────────────────────────
    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const items = e.dataTransfer.items;
        if (!items) return;

        const entries: FileEntry[] = [];

        const readEntry = async (entry: FileSystemDirectoryEntry | FileSystemFileEntry, basePath: string): Promise<void> => {
            if (entry.isFile) {
                const fileEntry = entry as FileSystemFileEntry;
                return new Promise((resolve) => {
                    fileEntry.file((file) => {
                        const relativePath = basePath ? `${basePath}/${file.name}` : file.name;
                        if (!shouldSkipFile(relativePath)) {
                            entries.push({ file, relativePath, size: file.size, isSwf: relativePath.toLowerCase().endsWith('.swf') });
                        }
                        resolve();
                    });
                });
            } else if (entry.isDirectory) {
                const dirReader = (entry as FileSystemDirectoryEntry).createReader();
                return new Promise((resolve) => {
                    dirReader.readEntries(async (subEntries) => {
                        const newBase = basePath ? `${basePath}/${entry.name}` : entry.name;
                        for (const sub of subEntries) await readEntry(sub as any, newBase);
                        resolve();
                    });
                });
            }
        };

        let folderName = '';
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry?.();
            if (!entry) continue;
            if (entry.isDirectory) {
                folderName = entry.name;
                const dirReader = (entry as FileSystemDirectoryEntry).createReader();
                await new Promise<void>((resolve) => {
                    dirReader.readEntries(async (subEntries) => {
                        for (const sub of subEntries) await readEntry(sub as any, '');
                        resolve();
                    });
                });
            } else {
                await readEntry(entry as any, '');
            }
        }
        processFiles(entries, folderName);
    }, [processFiles]);

    // ── Upload all files to server ────────────────────────────────────────────
    const handleUpload = useCallback(async () => {
        if (!gameName.trim()) { setError('Vui lòng nhập tên game'); return; }
        if (files.length === 0) { setError('Vui lòng chọn thư mục game'); return; }
        if (!entryFile) { setError('Vui lòng chọn file .swf chính'); return; }

        setUploading(true);
        setProgress(0);
        setError('');
        setResults(null);

        try {
            // STEP 1: Get presigned URLs
            const fileMeta = files.map(f => ({ path: f.relativePath, size: f.size }));
            const presignRes = await fetch('/api/roms/flash-presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameName: gameName.trim(), files: fileMeta })
            });
            const presignData = await presignRes.json();
            if (!presignRes.ok) throw new Error(presignData.error || 'Không thể tạo phiên upload');

            const allResults: UploadResult[] = [];
            let mainSwfUrl = '';
            let completed = 0;

            const mode = presignData.mode;

            // Helper to update progress continuously
            const reportProgress = () => {
                completed++;
                setProgress(Math.min(100, Math.round((completed / files.length) * 100)));
            };

            // STEP 2: Concurrency Queue
            const MAX_CONCURRENT = 5; // 5 parallel uploads max
            
            if (mode === 'r2') {
                const urlMap = new Map<string, any>(presignData.files.map((p: any) => [p.path, p]));
                
                const uploadFileR2 = async (entry: FileEntry) => {
                    const info = urlMap.get(entry.relativePath);
                    if (!info) throw new Error('Missing presigned URL');
                    
                    const res = await fetch(info.presignedUrl, {
                        method: 'PUT',
                        body: entry.file,
                        headers: { 'Content-Type': info.contentType || 'application/octet-stream' }
                    });
                    
                    if (!res.ok) throw new Error('Upload HTTP ' + res.status);
                    
                    const ext = entry.relativePath.toLowerCase();
                    if (entry.relativePath === entryFile || (ext.endsWith('.swf') && !mainSwfUrl)) {
                        mainSwfUrl = info.publicUrl;
                    }
                    return { path: entry.relativePath, size: entry.size, status: 'ok' as const };
                };

                // Simple concurrency runner
                let idx = 0;
                const runWorkers = async () => {
                    while (idx < files.length) {
                        const current = files[idx++];
                        try {
                            const res = await uploadFileR2(current);
                            allResults.push(res);
                        } catch (err: any) {
                            allResults.push({ path: current.relativePath, size: 0, status: 'error', error: err.message });
                        } finally {
                            reportProgress();
                        }
                    }
                };
                
                const workers = Array.from({ length: Math.min(MAX_CONCURRENT, files.length) }, () => runWorkers());
                await Promise.all(workers);
                
            } else {
                // Local mode: still use normal FormData but file by file or small batches
                const uploadFileLocal = async (entry: FileEntry) => {
                    const fd = new FormData();
                    fd.append('gameName', gameName.trim());
                    fd.append('entryFile', entryFile);
                    fd.append('file_0', entry.file);
                    fd.append('path_0', entry.relativePath);
                    
                    const res = await fetch('/api/roms/flash-upload', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Upload error');
                    
                    if (data.mainSwfUrl) mainSwfUrl = data.mainSwfUrl;
                    return data.results[0] as UploadResult;
                };

                let idx = 0;
                const runWorkers = async () => {
                    while (idx < files.length) {
                        const current = files[idx++];
                        try {
                            const res = await uploadFileLocal(current);
                            allResults.push(res);
                        } catch (err: any) {
                            allResults.push({ path: current.relativePath, size: 0, status: 'error', error: err.message });
                        } finally {
                            reportProgress();
                        }
                    }
                };
                
                const workers = Array.from({ length: Math.min(MAX_CONCURRENT, files.length) }, () => runWorkers());
                await Promise.all(workers);
            }

            setResults({
                mainSwfUrl,
                totalFiles: files.length,
                successCount: allResults.filter(r => r.status === 'ok').length,
                errorCount: allResults.filter(r => r.status === 'error').length,
                results: allResults,
            });

        } catch (err: any) {
            setError(err.message || 'Upload thất bại');
        } finally {
            setUploading(false);
        }
    }, [gameName, files, entryFile]);

    // ── Clear all state ───────────────────────────────────────────────────────
    const clearFiles = useCallback(() => {
        setFiles([]);
        setEntryFile('');
        setResults(null);
    }, []);

    return {
        // State
        gameName, setGameName,
        files, entryFile, setEntryFile,
        uploading, progress, results, error,
        inputRef,
        // Computed
        swfFiles: files.filter(f => f.isSwf),
        totalSize: files.reduce((s, f) => s + f.size, 0),
        // Actions
        handleFolderSelect,
        handleDrop,
        handleUpload,
        clearFiles,
    };
}
