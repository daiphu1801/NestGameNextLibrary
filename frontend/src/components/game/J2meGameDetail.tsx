import Image from 'next/image';
import { ArrowLeft, Play, Calendar, Globe, Tag, Smartphone, Heart, Loader2, Share2, Info, Trophy } from 'lucide-react';
import { StarRating } from '@/components/game/StarRating';
import { GameComments } from '@/components/game/GameComments';
import { cn } from '@/lib/utils';
import { Game } from '@/types';

interface J2meGameDetailProps {
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

export function J2meGameDetail({
  game, imageUrl, hasError, handleImageError,
  averageRating, totalRatings, myRating, isRating,
  isFavorite, user, t, router,
  handleRate, handlePlayNow, handleFavoriteToggle, handleShare
}: J2meGameDetailProps) {

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Teal/Green Aurora Background – Nokia nostalgia */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(20,184,166,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.3) 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
        }} 
      />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/80 border-b border-teal-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold uppercase tracking-wider text-xs">{t('common.back')}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 hover:border-teal-500/50"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={cn(
                  "p-2 rounded-lg transition-all border",
                  isFavorite
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-teal-500/50"
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
           
            {/* Left: Player + Controls Container */}
            <div className="w-full lg:col-span-8 flex flex-col gap-6">
               <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#0a0a0a] group group-hover:ring-teal-500/50 transition-all">
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl || '/game-console.png'} alt={game.name} className="w-full h-full object-cover opacity-40 blur-sm scale-105 group-hover:scale-100 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 transition-transform duration-500 group-hover:-translate-y-2">
                     <button
                       onClick={handlePlayNow}
                       className="group/btn relative w-20 h-20 bg-teal-500 hover:bg-teal-400 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_40px_rgba(20,184,166,0.5)] mb-6 cursor-pointer"
                     >
                       <Play className="w-8 h-8 text-black ml-2" fill="currentColor" />
                       <div className="absolute inset-0 rounded-full border-2 border-teal-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20" />
                     </button>
                     <h2 className="text-3xl font-black text-white tracking-tight mb-2">{t('gameDetails.playGame')}</h2>
                  </div>
               </div>

               {/* Rating Card */}
                <div className="relative p-6 rounded-2xl bg-teal-900/10 border border-teal-500/20 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-4 border-b border-teal-500/20 pb-2">
                    {t('game.rating')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                      <div>
                        <div className="text-4xl font-black text-white mb-1 shadow-teal-500 text-shadow-sm">{averageRating.toFixed(1)}</div>
                        <div className="text-xs text-teal-500/70 font-bold uppercase tracking-wider">{totalRatings} {t('game.ratings')}</div>
                      </div>
                      <StarRating rating={averageRating} size="lg" readonly />
                    </div>

                    {user ? (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                        <p className="text-sm text-slate-400 mb-2 font-medium">{t('gameDetails.yourRating')}:</p>
                        <div className="flex items-center justify-between">
                          <StarRating rating={myRating} size="md" onRate={handleRate} />
                          {isRating && <Loader2 className="w-4 h-4 animate-spin text-teal-400" />}
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
            {/* Right: Info & Comments */}
            <div className="w-full lg:col-span-4 flex flex-col gap-6">
              {/* Title Section */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-black uppercase tracking-widest mb-4">
                    <Smartphone className="w-3.5 h-3.5" /> {t('javaPortal.badge')}
                 </div>
                 <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-teal-200 tracking-tight leading-tight mb-6">
                    {game.name}
                 </h1>
                 
                 <div className="flex flex-col gap-3 text-sm font-medium">
                    {game.category && (
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                         <span className="text-slate-500">{t('gameDetails.platform')}</span>
                         <span className="uppercase tracking-wider text-xs font-bold text-teal-400">{t(`categories.${game.category}`, { defaultValue: game.category })}</span>
                      </div>
                    )}
                    {game.year && (
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                         <span className="text-slate-500">{t('gameDetails.year')}</span>
                         <span className="font-bold text-slate-300">{game.year}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                       <span className="text-slate-500">{t('gameDetails.playCount')}</span>
                       <span className="font-bold text-slate-300">{game.playCount || 0}</span>
                    </div>
                 </div>
              </div>

              {/* J2ME Info Banner */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 overflow-hidden">
                 <div className="absolute -right-20 -top-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                 <div className="relative z-10 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                       <Info className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-teal-400 mb-1 tracking-tight">{t('javaPortal.infoTitle')}</h3>
                      <p className="text-slate-300 text-[13px] leading-relaxed">
                        {t('javaPortal.infoDesc')}
                      </p>
                    </div>
                 </div>
              </div>

              {/* Description */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                 <h2 className="flex items-center gap-2 text-lg font-black text-white mb-4">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    {t('javaPortal.descTitle')}
                 </h2>
                 <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                   {game.description || t('gameDetails.defaultDescription', { name: game.name })}
                 </p>
              </div>

              {/* Comments Section */}
              <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <h2 className="flex items-center gap-2 text-lg font-black text-white mb-4">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                  {t('javaPortal.commentsTitle')}
                </h2>
                <GameComments gameId={Number(game.id)} />
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
