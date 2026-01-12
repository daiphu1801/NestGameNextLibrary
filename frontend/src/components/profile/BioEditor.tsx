'use client';

import { useState } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface BioEditorProps {
    currentBio?: string;
    onBioChange?: (newBio: string) => void;
}

export function BioEditor({ currentBio = '', onBioChange }: BioEditorProps) {
    const { refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(currentBio);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setError('');

        try {
            await userService.updateBio(bio);
            onBioChange?.(bio);
            await refreshUser();
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Cập nhật bio thất bại');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setBio(currentBio);
        setIsEditing(false);
        setError('');
    };

    if (isEditing) {
        return (
            <div className="space-y-2">
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Giới thiệu về bản thân..."
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {bio.length}/500
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all flex items-center gap-1.5"
                        >
                            <X className="w-3.5 h-3.5" />
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/80 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Check className="w-3.5 h-3.5" />
                            )}
                            Lưu
                        </button>
                    </div>
                </div>
                {error && (
                    <p className="text-xs text-red-400">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div className="group">
            <div className="flex items-start gap-2">
                <p className={cn(
                    "text-sm flex-1",
                    currentBio ? "text-foreground/80" : "text-muted-foreground italic"
                )}>
                    {currentBio || 'Chưa có giới thiệu'}
                </p>
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Chỉnh sửa"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
