import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Loader2, Zap } from 'lucide-react';
import { useGamepadToKeyboard } from '@/features/emulator/hooks/useGamepadToKeyboard';

interface FlashPlayerProps {
  gameUrl?: string;
}

declare global {
  interface Window {
    RufflePlayer: any;
  }
}

export function FlashPlayer({ gameUrl }: FlashPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kích hoạt nhận tín hiệu Gamepad khi Flash đã load xong
  useGamepadToKeyboard(isLoaded);

  // Focus lock & scroll prevent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ngăn chặn cuộn trang khi bấm phím mũi tên hoặc phím Space nếu container đang được focus
      const preventedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
      if (preventedKeys.includes(e.key) && containerRef.current?.contains(document.activeElement)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Ruffle
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !gameUrl) return;

    let player: any = null;
    try {
      window.RufflePlayer = window.RufflePlayer || {};
      const ruffle = window.RufflePlayer.newest();
      player = ruffle.createPlayer();
      
      player.style.width = '100%';
      player.style.height = '100%';
      
      containerRef.current.appendChild(player);

      player.load({
        url: gameUrl,
        allowScriptAccess: false,
        autoplay: 'on',
        unmuteOverlay: 'hidden',
        backgroundColor: '#000000',
      });
      
      // Auto focus canvas
      setTimeout(() => player.focus(), 500);

    } catch (err: any) {
      console.error('Ruffle init error:', err);
      setError('Lỗi khởi tạo trình mô phỏng Flash.');
    }

    return () => {
      if (containerRef.current && player) {
        try {
          containerRef.current.removeChild(player);
        } catch (e) { }
      }
    };
  }, [isLoaded, gameUrl]);

  return (
    <div 
      className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center relative rounded-xl border border-white/5 overflow-hidden shadow-2xl group"
      tabIndex={0}
    >
      <Script 
         src="https://unpkg.com/@ruffle-rs/ruffle" 
         onReady={() => setIsLoaded(true)}
         onError={() => setError('Không thể tải thư viện Ruffle')}
      />

      <div ref={containerRef} className="absolute inset-0 w-full h-full z-10" />

      {(!isLoaded || error) && (
        <>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-0" />
          
          <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center max-w-md animate-in slide-in-from-bottom-4 fade-in duration-700 pointer-events-none">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-400 to-rose-600 p-[3px] shadow-[0_0_40px_rgba(249,115,22,0.3)]">
              <div className="w-full h-full bg-[#1C1F26] rounded-[21px] flex items-center justify-center">
                 {error ? <Zap className="w-10 h-10 text-red-500" /> : <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />}
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 mb-3 tracking-tight">
                 {error ? 'LỖI TẢI PLAYER' : 'FLASH PLAYER'}
              </h2>
              <p className="text-[#A5B4CB] text-sm leading-relaxed mb-8">
                {error || 'Đang khởi tạo WebAssembly (Ruffle)... Vui lòng đợi trong giây lát.'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Ruffle Watermark */}
      <div className="absolute bottom-6 font-black text-white/5 tracking-[0.3em] text-4xl select-none pointer-events-none z-0">
        RUFFLE INSTANCE
      </div>
    </div>
  );
}
