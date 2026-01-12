'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    onRate?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
    showValue?: boolean;
    totalRatings?: number;
}

export function StarRating({
    rating,
    onRate,
    size = 'md',
    readonly = false,
    showValue = false,
    totalRatings
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleClick = (value: number) => {
        if (!readonly && onRate) {
            onRate(value);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (hoverRating || rating) >= star;
                    return (
                        <button
                            key={star}
                            type="button"
                            disabled={readonly}
                            onClick={() => handleClick(star)}
                            onMouseEnter={() => !readonly && setHoverRating(star)}
                            onMouseLeave={() => !readonly && setHoverRating(0)}
                            className={cn(
                                "transition-all duration-150",
                                readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
                            )}
                        >
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    "transition-colors duration-150",
                                    filled
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-transparent text-gray-400"
                                )}
                            />
                        </button>
                    );
                })}
            </div>

            {showValue && (
                <span className="text-sm text-muted-foreground">
                    {rating.toFixed(1)}
                    {totalRatings !== undefined && (
                        <span className="ml-1">({totalRatings})</span>
                    )}
                </span>
            )}
        </div>
    );
}
