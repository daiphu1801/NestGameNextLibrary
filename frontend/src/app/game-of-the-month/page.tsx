'use client';

import React, { useEffect, useState } from 'react';
import { Game } from '@/types';
import { gameService } from '@/services/gameService';
import { Play, Download, Settings, Loader2, Gamepad2, Info, ChevronRight, Star, Calendar, Users, Cpu } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';

export default function GameOfTheMonthPage() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGame() {
      try {
        const gotm = await gameService.getGameOfTheMonth();
        if (gotm) {
          setGame(gotm);
        }
      } catch (err) {
        console.error('Lỗi khi tải Game của Tháng', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGame();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h2 className="text-xl font-medium text-muted-foreground animate-pulse">Đang tải thông tin siêu phẩm...</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 relative pb-20">
        {!game ? (
          <div className="container mx-auto px-4 py-20">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-secondary/30 backdrop-blur-sm" style={{ minHeight: '500px' }}>
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
              <div className="relative h-full w-full flex flex-col items-center justify-center p-8 text-center gap-6 py-32">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)] mb-4">
                  <Gamepad2 className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg font-mono-tech">
                  GAME CỦA THÁNG ĐANG CẬP NHẬT
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Chúng tôi đang chọn lọc một tựa game tuyệt vời để giới thiệu trong tháng này. Hãy quay lại sau nhé! Trong lúc chờ đợi, bạn có thể khám phá hàng ngàn tựa game khác trong thư viện.
                </p>
                <div className="pt-8">
                  <Link href="/library" className="btn-primary inline-flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Khám phá Thư Viện
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
               {/* Background Layer */}
               <div className="absolute inset-0 bg-[#0F1626]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
                    style={{ backgroundImage: `url(${game.imageTitle || game.imageSnap || game.imageUrl})`, filter: 'blur(8px) saturate(1.5)' }}
                  />
                  {/* Subtle Grid Overlay */}
                  <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                  {/* Heavy Gradients for depth and legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent opacity-100" />
               </div>

               <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-20 pb-10">
                  
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">Trang Chủ</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/systems" className="hover:text-primary transition-colors">Các Hệ Máy</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white">Game Của Tháng</span>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
                     
                     {/* Left Content Area */}
                     <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        
                        {/* Featured Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                          <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                          </div>
                          <span className="text-amber-500 text-sm font-black tracking-widest uppercase">
                              Game Của Tháng {game.gameOfMonthPeriod ? `• ${game.gameOfMonthPeriod}` : ''}
                          </span>
                        </div>

                        {/* Title and Meta */}
                        <div className="space-y-4">
                           <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-2xl leading-[1.1] font-mono-tech">
                              {game.name}
                           </h1>
                           
                           <div className="flex flex-wrap items-center gap-4 text-sm font-medium pt-2">
                             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/5 text-white shadow-sm">
                               <Cpu className="w-4 h-4 text-purple-400" />
                               <span className="uppercase tracking-wider">{game.system || 'N/A'}</span>
                             </div>
                             {game.categoryName && (
                               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/5 text-white shadow-sm">
                                 <Gamepad2 className="w-4 h-4 text-cyan-400" />
                                 <span>{game.categoryName}</span>
                               </div>
                             )}
                             {game.year && (
                               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/5 text-muted-foreground shadow-sm">
                                 <Calendar className="w-4 h-4" />
                                 <span>{game.year}</span>
                               </div>
                             )}
                              {game.rating && (
                                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                     <Star className="w-4 h-4 fill-amber-500" />
                                     <span>{game.rating.toFixed(1)} / 5.0</span>
                                 </div>
                             )}
                              {game.playCount !== undefined && (
                               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-muted-foreground shadow-sm">
                                 <Users className="w-4 h-4" />
                                 <span>{game.playCount.toLocaleString()} lượt</span>
                               </div>
                             )}
                           </div>
                        </div>

                        {/* Description */}
                        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl border-l-4 border-primary/50 pl-6 py-1">
                           {game.description || `Tựa game xuất sắc nhất được đội ngũ biên tập viên lựa chọn trong tháng. Trải nghiệm đồ họa vượt thời gian, âm nhạc đỉnh cao và lối chơi kinh điển ngay trên trình duyệt của bạn mà không cần cài đặt.`}
                        </p>

                        {/* Call to Actions */}
                        <div className="pt-6 flex flex-col sm:flex-row items-center gap-6">
                           {['ps1', 'psp', 'saturn'].includes(game.system?.toLowerCase() || '') ? (
                              <div className="w-full sm:w-auto flex flex-col gap-3">
                                  <Link
                                      href={`/games/${game.id}/play`}
                                      className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black text-white transition-all duration-300 ease-in-out rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:-translate-y-1 overflow-hidden w-full sm:w-auto"
                                      style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                                  >
                                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                                      <Download className="w-6 h-6 relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-transform" />
                                      <span className="relative z-10 uppercase tracking-widest text-shadow-sm">Lưu Cache & Chơi ngay</span>
                                  </Link>
                                  <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl max-w-md">
                                      <Info className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-emerald-100/80 leading-snug">
                                        <strong className="text-emerald-400">Trải nghiệm Game Nặng (300MB+):</strong> Dữ liệu sẽ được lưu tự động vào trình duyệt (IndexedDB) để chơi offline vào những lần sau, tốc độ cực nhanh.
                                      </p>
                                  </div>
                              </div>
                          ) : (
                              <Link
                                  href={`/games/${game.id}/play`}
                                  className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-black text-white transition-all duration-300 ease-in-out rounded-2xl shadow-[0_0_40px_rgba(60,80,224,0.4)] hover:shadow-[0_0_60px_rgba(60,80,224,0.6)] hover:-translate-y-1 overflow-hidden w-full sm:w-auto"
                                  style={{ background: 'linear-gradient(135deg, #3C50E0 0%, #6577F3 100%)' }}
                              >
                                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                                  <Play className="w-6 h-6 relative z-10 group-hover:scale-110 group-hover:translate-x-1 transition-transform" />
                                  <span className="relative z-10 uppercase tracking-widest text-shadow-sm">Chơi Game Ngay</span>
                              </Link>
                          )}
                        </div>
                     </div>

                     {/* Right Cover Art - Stunning Visual */}
                     <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg aspect-[3/4] relative z-20 perspective-1000 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                        <div className="relative w-full h-full transform-style-3d transition-transform duration-700 hover:rotate-y-12 hover:-rotate-x-5 group">
                           {/* Glow Effect */}
                           <div className="absolute -inset-4 bg-gradient-to-tr from-primary/40 via-purple-500/40 to-cyan-500/40 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                           
                           {/* The Cover */}
                           <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden border border-white/10 bg-black/50 before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/10 before:to-transparent before:z-10">
                              {game.imageUrl ? (
                                   <img 
                                      src={game.imageUrl} 
                                      alt={game.name} 
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                               ) : (
                                   <div className="w-full h-full flex flex-col items-center justify-center bg-secondary gap-4">
                                       <Gamepad2 className="w-24 h-24 text-white/20" />
                                       <span className="text-white/40 font-mono-tech font-bold">NO COVER ART</span>
                                   </div>
                               )}
                               
                               {/* Glass Reflection */}
                               <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 z-20 pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                           </div>
                        </div>
                     </div>

                  </div>
               </div>
            </div>

            {/* Screenshots Section (Bonus if available, else nice filler) */}
             {(game.imageSnap || game.imageTitle) && (
              <div className="container mx-auto px-4 lg:px-8 py-20 border-t border-white/5 relative z-10">
                 <div className="mb-12">
                   <h2 className="text-3xl font-black font-mono-tech text-white mb-4">MỘT SỐ HÌNH ẢNH</h2>
                   <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {game.imageSnap && (
                      <div className="group rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/50 aspect-video relative">
                         <img src={game.imageSnap} alt={`${game.name} Gameplay`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold tracking-wider">GAMEPLAY SNAPSHOT</span>
                         </div>
                      </div>
                    )}
                    {game.imageTitle && (
                      <div className="group rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/50 aspect-video relative">
                         <img src={game.imageTitle} alt={`${game.name} Title Screen`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold tracking-wider">TITLE SCREEN</span>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
