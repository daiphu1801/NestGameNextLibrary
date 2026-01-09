'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';
import { Game } from '@/types';
import { cn } from '@/lib/utils';
import { imageService } from '@/services/imageService';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GameCardProps {
  game: Game;
  onClick: () => void;
  priority?: boolean;
}

export function GameCard({ game, onClick, priority = false }: GameCardProps) {
  const { t } = useLanguage();
  const [imageUrl, setImageUrl] = useState(game.image || game.thumbnail || '/placeholder.png');
  const [fallbackUrls] = useState(() =>
    imageService.generateFallbackUrls(game.name, game.image)
  );
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (hasError) return;

    const nextUrl = imageService.getNextFallbackUrl(fallbackUrls, currentFallbackIndex);

    if (nextUrl) {
      setImageUrl(nextUrl);
      setCurrentFallbackIndex(currentFallbackIndex + 1);
      imageService.markAsFailed(fallbackUrls[currentFallbackIndex]);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-primary/30 bg-card"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] bg-secondary overflow-hidden">
        {!hasError ? (
          <Image
            src={imageUrl}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <div className="text-center p-4">
              <div className="text-5xl mb-3 opacity-40">🎮</div>
              <p className="text-xs text-muted-foreground font-medium line-clamp-2 px-2 font-mono-tech uppercase">
                {game.name}
              </p>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-primary/50">
            <Play className="h-6 w-6 text-primary-foreground ml-0.5 fill-current" />
          </div>
        </div>

        {/* Rating Badge - Top Right */}
        {game.rating && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm flex items-center gap-1 border border-white/10">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white font-mono-tech">{game.rating}</span>
          </div>
        )}

        {/* Hot Badge - Top Left */}
        {(game.isFeatured || (game.rating && game.rating >= 4.5)) && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-gradient-to-r from-rose-500 to-orange-500 animate-pulse shadow-lg shadow-rose-500/30">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono-tech">🔥 HOT</span>
          </div>
        )}

        {/* Region Badge - Bottom Left */}
        {game.region && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/20">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono-tech">
              {game.region === 'Japan' || game.region === 'J' ? '🇯🇵 JP' :
                game.region === 'USA' || game.region === 'U' ? '🇺🇸 US' :
                  game.region === 'Europe' || game.region === 'E' ? '🇪🇺 EU' :
                    game.region}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 bg-card">
        <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono-tech">{game.year || 'Classic'}</span>
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase font-mono-tech border border-primary/20">
            NES
          </span>
        </div>
      </div>
    </div>
  );
}
