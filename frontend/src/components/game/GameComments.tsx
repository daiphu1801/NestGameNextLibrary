'use client';

import { useState, useEffect } from 'react';
import { Send, Trash2, MessageCircle, Loader2 } from 'lucide-react';
import { userService, type GameComment } from '@/services/userService';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GameCommentsProps {
    gameId: number;
}

export function GameComments({ gameId }: GameCommentsProps) {
    const { user } = useAuth();
    const { t, locale } = useLanguage();
    const [comments, setComments] = useState<GameComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [gameId]);

    const loadComments = async () => {
        setIsLoading(true);
        try {
            const data = await userService.getGameComments(gameId);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const comment = await userService.addComment(gameId, newComment.trim());
            setComments([comment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        try {
            await userService.deleteComment(gameId, commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">
                    {t('gameDetails.comments')} ({comments.length})
                </h3>
            </div>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('gameDetails.writeComment')}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>
            ) : (
                <p className="text-sm text-muted-foreground bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                    {t('gameDetails.loginToComment')}
                </p>
            )}

            {/* Comments List */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                    {t('gameDetails.noComments')}
                </p>
            ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-accent">
                                {comment.avatarUrl ? (
                                    <img
                                        src={comment.avatarUrl}
                                        alt={comment.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold uppercase">
                                        {comment.username.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white text-sm">
                                        {comment.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/80 break-words">
                                    {comment.content}
                                </p>
                            </div>

                            {/* Delete button (only for own comments) */}
                            {user && user.id === comment.userId && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                                    title="Xóa bình luận"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
