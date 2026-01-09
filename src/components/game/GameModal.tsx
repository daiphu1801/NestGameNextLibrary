'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Game } from '@/types';
import { emulatorService } from '@/services/emulatorService';
import { storageService } from '@/services/storageService';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GameModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const loadGame = useCallback(async () => {
    if (!containerRef.current || !game.path) {
      setError('Game path not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await emulatorService.loadGame(game.path, containerRef.current);
      storageService.addRecentGame(game.id);
      setIsLoading(false);

      // Focus the container for keyboard input
      containerRef.current?.focus();
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game. Please check your configuration.');
      setIsLoading(false);
    }
  }, [game.path, game.id]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      loadGame();
    }

    return () => {
      emulatorService.unload();
    };
  }, [isOpen, game, loadGame]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isFullscreen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleClose = () => {
    emulatorService.unload();
    onClose();
  };

  const toggleFullscreen = async () => {
    if (!modalRef.current) return;

    if (!document.fullscreenElement) {
      await modalRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl h-[90vh] flex flex-col bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-lg">🎮</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{game.name}</h2>
              <p className="text-xs text-muted-foreground">
                {t('modal.escHint') || 'Nhấn ESC để quay lại'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white border border-white/10"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              <span>{t('modal.fullscreen') || 'Fullscreen'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors text-sm text-rose-400 border border-rose-500/20"
            >
              <X className="w-4 h-4" />
              <span>{t('modal.close') || 'Đóng'} (ESC)</span>
            </button>
          </div>
        </div>

        {/* Game Container */}
        <div className="flex-1 relative bg-black">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium text-white">{t('game.loading') || 'Đang tải game'}...</p>
              <p className="text-sm text-muted-foreground">{t('modal.pleaseWait') || 'Vui lòng đợi'}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
              <p className="text-lg font-medium text-white">{t('modal.loadFailed') || 'Không thể tải game'}</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={loadGame}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                >
                  {t('modal.tryAgain') || 'Thử lại'}
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium"
                >
                  {t('modal.close') || 'Đóng'}
                </button>
              </div>
            </div>
          )}

          {/* Emulator Container */}
          <div
            id="emulator-container"
            ref={containerRef}
            className="w-full h-full flex items-center justify-center bg-black"
            tabIndex={0}
          />
        </div>

        {/* Control Hints Bar */}
        <div className="flex items-center justify-center gap-6 px-4 py-3 bg-[#111] border-t border-white/10">
          <ControlHint keys="↑↓←→" label={t('docs.controls.movement') || 'Di chuyển'} />
          <ControlHint keys="Z" label={t('docs.controls.aButton') || 'Nút A'} color="text-cyan-400" />
          <ControlHint keys="X" label={t('docs.controls.bButton') || 'Nút B'} color="text-cyan-400" />
          <ControlHint keys="Enter" label="Start" color="text-green-400" />
          <ControlHint keys="ESC" label={t('modal.back') || 'Quay lại'} color="text-rose-400" />
        </div>
      </div>
    </div>
  );
}

// Control Hint Component
function ControlHint({ keys, label, color = 'text-white' }: { keys: string; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <kbd className={`px-2 py-1 rounded bg-white/10 font-mono text-xs ${color}`}>
        {keys}
      </kbd>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
