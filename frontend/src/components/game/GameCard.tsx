'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Star, Heart, Sparkles, LogIn, Info } from 'lucide-react';
import { Game } from '@/types';
import { cn } from '@/lib/utils';
import { imageService } from '@/services/imageService';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useFavorites } from '@/components/providers/FavoritesProvider';

interface GameCardProps {
  game: Game;
  onPlayClick?: () => void;
  onDetailsClick?: () => void;
  onClick?: () => void;
  onLoginRequired?: () => void;
  priority?: boolean;
}

export function GameCard({ game, onPlayClick, onDetailsClick, onLoginRequired, priority = false, onClick }: GameCardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();

  const [imageUrl, setImageUrl] = useState(game.image || game.thumbnail || '/placeholder.png');
  const [fallbackUrls] = useState(() =>
    imageService.generateFallbackUrls(game.name, game.image)
  );
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);

  // Get favorite status from context (no local state needed)
  const isFavorite = checkIsFavorite(game.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If not logged in, show login prompt
    if (!user) {
      setShowLoginTooltip(true);
      setTimeout(() => setShowLoginTooltip(false), 2500);
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
      await toggleFavorite(game.id);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showToast('Không thể kết nối server. Thử lại sau.', 'offline');
    }
  };


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

        {/* Hover Overlay with Play + Details Buttons — desktop only */}
        <div className="hidden lg:flex absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex-col items-center justify-center gap-3">
          {onPlayClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onPlayClick(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-primary/50 hover:bg-primary/90"
            >
              <Play className="h-4 w-4 fill-current" />
              {t('game.playNow')}
            </button>
          )}
          {onDetailsClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onDetailsClick(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-white text-sm transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-white/20 border border-white/20"
            >
              <Info className="h-3.5 w-3.5" />
              {t('game.details')}
            </button>
          )}
        </div>

        {/* ===== FAVORITE BUTTON - TOP RIGHT ===== */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "absolute top-2 right-2 z-10 w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300",
            "backdrop-blur-md border shadow-lg",
            user ? (
              isFavorite
                ? "bg-gradient-to-r from-rose-500 to-pink-500 border-rose-400 shadow-rose-500/40 scale-110"
                : "bg-black/50 border-white/20 hover:bg-rose-500/20 hover:border-rose-400/50 hover:scale-110"
            ) : (
              "bg-black/30 border-white/10 hover:bg-white/10"
            )
          )}
          title={user ? (isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích") : "Đăng nhập để thêm yêu thích"}
        >
          {user ? (
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-300",
                isFavorite ? "text-white fill-white" : "text-white/80",
                isAnimating && "animate-ping"
              )}
            />
          ) : (
            <Heart className="w-4 h-4 text-white/50" />
          )}

          {/* Sparkle effect when adding */}
          {isAnimating && isFavorite && (
            <>
              <Sparkles className="absolute w-3 h-3 text-yellow-300 -top-1 -right-1 animate-ping" />
              <Sparkles className="absolute w-2 h-2 text-pink-300 -bottom-0.5 -left-0.5 animate-ping delay-100" />
            </>
          )}
        </button>

        {/* Login Required Tooltip */}
        {showLoginTooltip && (
          <div className="absolute top-14 right-1 z-20 px-3 py-2 rounded-lg bg-black/90 border border-primary/30 text-white text-xs animate-in fade-in slide-in-from-top-2 duration-200 max-w-[calc(100%-8px)]">
            <div className="flex items-center gap-1.5">
              <LogIn className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="leading-tight">Đăng nhập để thêm yêu thích</span>
            </div>
          </div>
        )}

        {/* Rating Badge */}
        {game.rating && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm flex items-center gap-1 border border-white/10">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white font-mono-tech">{game.rating}</span>
          </div>
        )}

        {/* Hot Badge */}
        {(game.isFeatured || (game.rating && game.rating >= 4.5)) && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-gradient-to-r from-rose-500 to-orange-500 animate-pulse shadow-lg shadow-rose-500/30">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono-tech">🔥 HOT</span>
          </div>
        )}

        {/* Region Badge */}
        {game.region && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/20">
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
      <div className="p-3 sm:p-4 space-y-2 bg-card">
        <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono-tech">{game.year || 'Classic'}</span>
          <div className="flex items-center gap-2">
            {user && isFavorite && (
              <span className="text-rose-500 animate-in fade-in duration-300">
                <Heart className="w-3 h-3 fill-current" />
              </span>
            )}
            {(() => {
              const sys = (game.system || 'nes').toLowerCase();
              let sysStyles = "bg-primary/10 text-primary border-primary/20";
              let label = "NES";
              
              if (sys === 'snes') { sysStyles = "bg-purple-500/10 text-purple-400 border-purple-500/20"; label = "SNES"; }
              else if (sys === 'gba') { sysStyles = "bg-blue-500/10 text-blue-400 border-blue-500/20"; label = "GBA"; }
              else if (sys === 'genesis') { sysStyles = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"; label = "GENESIS"; }
              else { sysStyles = "bg-red-500/10 text-red-400 border-red-500/20"; }

              return (
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-tech border", sysStyles)}>
                  {label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Mobile: Play + Details buttons — always visible on mobile, hidden on desktop */}
        {(onPlayClick || onDetailsClick) && (
          <div className="lg:hidden flex items-center gap-2 pt-1">
            {onPlayClick && (
              <button
                onClick={(e) => { e.stopPropagation(); onPlayClick(); }}
                className="flex-1 flex items-center justify-center gap-1 h-9 rounded-lg bg-primary text-white text-[11px] whitespace-nowrap active:scale-95 transition-transform hover:bg-primary/90"
              >
                <Play className="h-3 w-3 fill-current flex-shrink-0" />
                {t('game.playNow')}
              </button>
            )}
            {onDetailsClick && (
              <button
                onClick={(e) => { e.stopPropagation(); onDetailsClick(); }}
                className="flex-1 flex items-center justify-center gap-1 h-9 rounded-lg bg-secondary border border-white/10 text-foreground text-[11px] whitespace-nowrap active:scale-95 transition-transform hover:bg-white/10"
              >
                <Info className="h-3 w-3 flex-shrink-0" />
                {t('game.details')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
