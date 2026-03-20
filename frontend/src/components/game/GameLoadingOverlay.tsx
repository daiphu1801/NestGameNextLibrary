'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Download,
  Sparkles,
  Zap,
  Info,
  Cpu,
  Trophy,
  History,
  ShieldCheck,
  X
} from 'lucide-react';
import { Game } from '@/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GameLoadingOverlayProps {
  game: Game;
  progress?: number; // 0 to 100
  tip?: string;
  onClose?: () => void;
}

const DEFAULT_TIPS = [
  "Bạn có thể lưu trạng thái game (Save State) bất cứ lúc nào bằng phím F5.",
  "Sử dụng phím F8 để tải nhanh trạng thái game đã lưu gần nhất.",
  "Chơi trên trình duyệt giúp bạn không cần cài đặt bất kỳ phần mềm giả lập nào.",
  "Hệ máy PS1/PSP yêu cầu tải dữ liệu lớn, hãy kiên nhẫn một chút nhé!",
  "Dữ liệu game sẽ được lưu vào bộ nhớ đệm trình duyệt để lần sau load nhanh hơn.",
  "Bạn có thể kết nối tay cầm (Gamepad) qua cổng USB hoặc Bluetooth để chơi dễ hơn.",
  "Phím ESC giúp bạn quay lại menu hoặc đóng trình giả lập.",
  "Đừng quên đăng nhập để lưu lịch sử chơi game và đồng bộ phím điều khiển."
];

export function GameLoadingOverlay({ game, progress: manualProgress, tip: manualTip, onClose }: GameLoadingOverlayProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const translatedTips = t('game.loadingTipsList') || [];
  const tips = Array.isArray(translatedTips) ? translatedTips : DEFAULT_TIPS;

  // Auto-progress simulation if no manual progress is provided
  useEffect(() => {
    if (manualProgress !== undefined) {
      setProgress(manualProgress);
      return;
    }

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const inc = prev < 30 ? 2 : prev < 60 ? 1 : 0.5;
        return prev + inc;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [manualProgress]);

  // Rotate tips
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(tipTimer);
  }, [tips.length]);

  const currentTip = manualTip || tips[tipIndex];

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black overflow-hidden select-none text-white">
      {/* Close Button (Optional) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-[70] p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all group"
          title="Close Preview"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 blur-2xl scale-110"
          style={{ backgroundImage: `url(${game.imageTitle || game.imageSnap || game.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center">

        {/* Animated Icon Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl scale-150 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-white/5 rounded-3xl" />
            <Gamepad2 className="w-12 h-12 text-white animate-bounce duration-[2000ms]" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Game Title & System */}
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg font-tech uppercase">
            {game.name}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
              {game.system || 'SYSTEM_CORE'}
            </span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase animate-pulse">
              Initializing Core...
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-white/50 px-1">
            <div className="flex items-center gap-2">
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Downloading Assets</span>
            </div>
            <span className="text-primary">{Math.floor(progress)}%</span>
          </div>

          <div className="relative h-2 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden shadow-inner">
            {/* Progress Fill */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent to-primary animate-shimmer"
              style={{ width: `${progress}%`, transition: 'width 0.4s ease-out', backgroundSize: '1000px 100%' }}
            />
            {/* Glow Effect */}
            <div
              className="absolute top-0 h-full bg-white/20 blur-sm mix-blend-overlay"
              style={{ left: `${progress - 5}%`, width: '10%' }}
            />
          </div>

          <div className="flex justify-between items-center px-1">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={cn(
                    "w-1 h-1 rounded-full transition-all duration-500",
                    progress > (i * 20) ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] scale-125" : "bg-white/10"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono opacity-50">
              CRC-32 CHECKING...
            </span>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-16 w-full flex flex-col items-center">
          <div className="flex items-center gap-2 text-primary/70 mb-4">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('game.loadingTips') || 'BẠN CÓ BIẾT?'}</span>
          </div>

          <div className="relative min-h-[60px] flex items-center justify-center text-center">
            <p className="text-white/80 text-sm md:text-base italic leading-relaxed max-w-lg mb-0 animate-in fade-in slide-in-from-bottom-2 duration-1000" key={tipIndex}>
              "{currentTip}"
            </p>
          </div>
        </div>

        {/* Technical Features Footer */}
        <div className="mt-16 grid grid-cols-3 gap-8 opacity-20 hover:opacity-100 transition-opacity duration-700 border-t border-white/5 pt-8 w-full max-w-md">
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-[8px] font-bold text-white/60 tracking-tighter text-center">LOCAL CACHE<br />ENABLED</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Cpu className="w-4 h-4 text-white" />
            <span className="text-[8px] font-bold text-white/60 tracking-tighter text-center">WASM CORE<br />HYBRID</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <History className="w-4 h-4 text-white" />
            <span className="text-[8px] font-bold text-white/60 tracking-tighter text-center">AUTO-SAVE<br />SUPPORTED</span>
          </div>
        </div>

      </div>

      {/* Animation Styles */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>
    </div>
  );
}
