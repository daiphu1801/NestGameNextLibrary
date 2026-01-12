'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { userService } from '@/services/userService';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
    currentAvatarUrl?: string;
    username: string;
    onAvatarChange?: (newUrl: string | null) => void;
}

export function AvatarUpload({ currentAvatarUrl, username, onAvatarChange }: AvatarUploadProps) {
    const { refreshUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Chỉ chấp nhận file ảnh');
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            setError('Kích thước file tối đa 2MB');
            return;
        }

        setError('');
        setIsUploading(true);

        try {
            const newAvatarUrl = await userService.uploadAvatar(file);
            onAvatarChange?.(newAvatarUrl);
            await refreshUser();
        } catch (err: any) {
            setError(err.message || 'Upload thất bại');
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async () => {
        setIsUploading(true);
        setError('');

        try {
            await userService.deleteAvatar();
            onAvatarChange?.(null);
            await refreshUser();
        } catch (err: any) {
            setError(err.message || 'Xóa avatar thất bại');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative inline-block group">
            {/* Avatar Display */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl mx-auto bg-gradient-to-br from-gray-800 to-black p-1">
                {currentAvatarUrl ? (
                    <img
                        src={currentAvatarUrl}
                        alt={username}
                        className="w-full h-full object-cover rounded-full"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center rounded-full">
                        <span className="text-5xl font-bold text-white uppercase">
                            {username.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Loading overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                )}
            </div>

            {/* Upload Button */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={cn(
                    "absolute bottom-1 right-1 p-2.5 rounded-full bg-primary text-white",
                    "hover:bg-primary/80 transition-all hover:scale-110 shadow-lg border-2 border-background",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                title="Thay đổi avatar"
            >
                <Camera className="w-4 h-4" />
            </button>

            {/* Delete Button (when avatar exists) */}
            {currentAvatarUrl && !isUploading && (
                <button
                    onClick={handleDelete}
                    className="absolute bottom-1 left-1 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg border-2 border-background"
                    title="Xóa avatar"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Error Message */}
            {error && (
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
                    {error}
                </p>
            )}
        </div>
    );
}
