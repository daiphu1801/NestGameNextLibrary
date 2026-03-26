import Image from 'next/image';
import { ArrowLeft, Play, Calendar, Globe, Tag, Zap, Heart, Loader2, Share2, Info, Trophy } from 'lucide-react';
import { StarRating } from '@/components/game/StarRating';
import { GameComments } from '@/components/game/GameComments';
import { cn } from '@/lib/utils';
import { Game } from '@/types';

interface FlashGameDetailProps {
  game: Game;
  imageUrl: string;
  hasError: boolean;
  handleImageError: () => void;
  averageRating: number;
  totalRatings: number;
  myRating: number;
  isRating: boolean;
  isFavorite: boolean;
  user: any;
  t: (key: string, ...args: any[]) => string;
  router: any;
  handleRate: (rating: number) => void;
  handlePlayNow: () => void;
  handleFavoriteToggle: () => void;
  handleShare: () => void;
}

export function FlashGameDetail({
  game, imageUrl, hasError, handleImageError,
  averageRating, totalRatings, myRating, isRating,
  isFavorite, user, t, router,
  handleRate, handlePlayNow, handleFavoriteToggle, handleShare
}: FlashGameDetailProps) {

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Intense Amber/Orange Aurora Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
        }} 
      />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/80 border-b border-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold uppercase tracking-wider text-xs">{t('common.back')}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 hover:border-orange-500/50"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={cn(
                  "p-2 rounded-lg transition-all border",
                  isFavorite
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-orange-500/50"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
           
           {/* Left: Arcade Screen & Stats */}
           <div className="w-full max-w-xl mx-auto lg:max-w-none lg:w-2/5 flex-shrink-0">
             <div className="sticky top-28 space-y-6 sm:space-y-8">
                {/* Screen Frame */}
                <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-orange-500/40 shadow-[0_0_40px_rgba(249,115,22,0.2)] group bg-black">
                  {!hasError ? (
                    <Image 
                      src={imageUrl} 
                      alt={game.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      onError={handleImageError} 
                      priority 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-900/40 to-rose-900/40">
                      <Zap className="w-32 h-32 text-orange-500/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                     <button
                        onClick={handlePlayNow}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        <Zap className="w-6 h-6 fill-current animate-pulse" />
                        CHƠI FLASH NGAY
                      </button>
                  </div>
                </div>

                {/* Rating Card */}
                <div className="relative p-6 rounded-2xl bg-orange-900/10 border border-orange-500/20 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-4 border-b border-orange-500/20 pb-2">
                    {t('game.rating')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                      <div>
                        <div className="text-4xl font-black text-white mb-1 shadow-orange-500 text-shadow-sm">{averageRating.toFixed(1)}</div>
                        <div className="text-xs text-orange-500/70 font-bold uppercase tracking-wider">{totalRatings} {t('game.ratings')}</div>
                      </div>
                      <StarRating rating={averageRating} size="lg" readonly />
                    </div>

                    {user ? (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                        <p className="text-sm text-slate-400 mb-2 font-medium">{t('gameDetails.yourRating')}:</p>
                        <div className="flex items-center justify-between">
                          <StarRating rating={myRating} size="md" onRate={handleRate} />
                          {isRating && <Loader2 className="w-4 h-4 animate-spin text-orange-400" />}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                        <p className="text-sm text-slate-400">{t('gameDetails.loginToRate')}</p>
                      </div>
                    )}
                  </div>
                </div>
             </div>
           </div>

           {/* Right: Info & Comments */}
           <div className="flex-1 w-full max-w-xl mx-auto lg:max-w-none space-y-8 sm:space-y-10">
              {/* Title Section */}
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest mb-6">
                    <Zap className="w-3.5 h-3.5 fill-current" /> {t('flashPortal.badge')}
                 </div>
                 <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-200 tracking-tight leading-tight mb-8 drop-shadow-lg">
                    {game.name}
                 </h1>
                 
                 <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                    {game.category && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                         <Tag className="w-4 h-4 text-orange-500" />
                         <span className="uppercase tracking-wider text-xs font-bold">{t(`categories.${game.category}`, { defaultValue: game.category })}</span>
                      </div>
                    )}
                    {game.year && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                         <Calendar className="w-4 h-4 text-orange-500" />
                         <span className="font-bold text-xs">{game.year}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                       <Trophy className="w-4 h-4 text-orange-500" />
                       <span className="font-bold text-xs">{game.playCount || 0} {t('flashPortal.playCount')}</span>
                    </div>
                 </div>
              </div>

              {/* Ruffle Info Banner */}
              <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 flex flex-col sm:flex-row gap-6 items-start sm:items-center overflow-hidden">
                 <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                 <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                    <Info className="w-7 h-7 text-orange-400" />
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-xl font-black text-orange-400 mb-2 tracking-tight">{t('flashPortal.infoTitle')}</h3>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      {t('flashPortal.infoDesc')}
                    </p>
                 </div>
              </div>

              {/* Description */}
              <div className="pt-4">
                 <h2 className="flex items-center gap-3 text-2xl font-black text-white mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-rose-500 rounded-full" />
                    {t('flashPortal.descTitle')}
                 </h2>
                 <p className="text-lg text-slate-300 leading-relaxed font-normal whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5">
                   {game.description || t('gameDetails.defaultDescription', { name: game.name })}
                 </p>
              </div>

              {/* Comments Section */}
              <div className="pt-8 mt-12 border-t border-white/10">
                <h2 className="flex items-center gap-3 text-2xl font-black text-white mb-8">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                  {t('flashPortal.commentsTitle')}
                </h2>
                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <GameComments gameId={Number(game.id)} />
                </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
