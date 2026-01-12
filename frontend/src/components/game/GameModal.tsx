import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Loader2, AlertCircle, Maximize2, Minimize2, LogIn } from 'lucide-react';
import { Game } from '@/types';
import { emulatorService } from '@/services/emulatorService';
import { storageService } from '@/services/storageService';
import { userService } from '@/services/userService';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoginModal, RegisterModal, ForgotPasswordModal } from '@/components/auth';

interface GameModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Trial Mode State
  const [trialTimeLeft, setTrialTimeLeft] = useState(10); // 10 seconds trial
  const [isTrialEnded, setIsTrialEnded] = useState(false);

  // Auth Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset trial state when modal opens or user logs in
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setIsTrialEnded(false);
        setTrialTimeLeft(10);
      } else {
        setIsTrialEnded(false);
        setTrialTimeLeft(10);
      }
    }
  }, [isOpen, user]);

  // Trial Timer Logic
  useEffect(() => {
    if (isOpen && !user && !isLoading && !isTrialEnded && !error) {
      timerRef.current = setInterval(() => {
        setTrialTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTrialEnded(true);
            emulatorService.unload(); // Stop the game
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, user, isLoading, isTrialEnded, error]);

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

      // Record play history if user is logged in
      if (user) {
        await userService.recordPlayHistory(game.id).catch(err => {
          console.error('Failed to record play history:', err);
          // Don't block gameplay if history recording fails
        });
      }

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
      {/* Backdrop - Removed backdrop-blur for performance on older devices */}
      <div
        className="absolute inset-0 bg-black/95"
        onClick={handleClose}
      />

      {/* Modal Container - New sidebar layout */}
      <div
        ref={modalRef}
        className="relative w-full max-w-7xl h-[90vh] flex flex-col bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-lg">🎮</span>
            </div>
            <h2 className="text-lg font-bold text-white">{game.name}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white border border-white/10"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{t('modal.fullscreen') || 'Fullscreen'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors text-sm text-rose-400 border border-rose-500/20"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">{t('modal.close') || 'Đóng'}</span>
            </button>
          </div>
        </div>

        {/* Trial Timer Bar (for unauthenticated users) */}
        {!user && !isTrialEnded && !error && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 text-center">
            <p className="text-xs font-bold text-yellow-500 animate-pulse">
              {t('trial.active', { seconds: trialTimeLeft }) || `Trial Mode: ${trialTimeLeft}s remaining`}
            </p>
          </div>
        )}

        {/* Main Content - Sidebar Layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar - Player 1 Controls */}
          <div className="hidden md:flex flex-col w-[140px] bg-[#0d0d0d] border-r border-white/10 p-3">
            <div className="text-xs font-bold text-blue-400 mb-3 text-center">
              Player 1
            </div>
            <div className="flex flex-col gap-2">
              <ControlHintVertical keys="W A S D" label={t('docs.controls.movement') || 'Di chuyển'} />
              <ControlHintVertical keys="J" label={t('modal.buttonA') || 'Nút A'} color="text-cyan-400" />
              <ControlHintVertical keys="K" label={t('modal.buttonB') || 'Nút B'} color="text-cyan-400" />
              <ControlHintVertical keys="Enter" label="Start" color="text-green-400" />
              <ControlHintVertical keys="Shift" label="Select" color="text-yellow-400" />
              <div className="mt-4 px-1">
                <p className="text-[10px] text-muted-foreground text-center italic leading-tight opacity-70">
                  {t('modal.controlsNote') || '*Vai trò (Nhảy/Đánh/...) của A/B tùy thuộc vào từng game'}
                </p>
              </div>
            </div>
          </div>

          {/* Game Container */}
          <div className="flex-1 relative bg-black min-w-0">
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

            {/* Trial Ended Overlay */}
            {isTrialEnded && !user && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-20 animate-in fade-in duration-300">
                <div className="relative p-8 bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LogIn className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{t('trial.loginRequired') || 'Login Required'}</h3>
                  <p className="text-muted-foreground mb-8">
                    {t('trial.desc', { gameName: game.name }) || `Your 10-second trial has ended. Please login to continue playing ${game.name}.`}
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                      {t('trial.loginToContinue') || 'Login to Continue'}
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                    >
                      {t('trial.closeGame') || 'Close Game'}
                    </button>
                  </div>
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

          {/* Right Sidebar - Player 2 Controls */}
          <div className="hidden md:flex flex-col w-[140px] bg-[#0d0d0d] border-l border-white/10 p-3">
            <div className="text-xs font-bold text-red-400 mb-3 text-center">
              Player 2
            </div>
            <div className="flex flex-col gap-2">
              <ControlHintVertical keys="↑ ↓ ← →" label={t('docs.controls.movement') || 'Di chuyển'} />
              <ControlHintVertical keys="1" label={t('modal.buttonA') || 'Nút A'} color="text-cyan-400" />
              <ControlHintVertical keys="2" label={t('modal.buttonB') || 'Nút B'} color="text-cyan-400" />
              <ControlHintVertical keys="3" label="Start" color="text-green-400" />
              <ControlHintVertical keys="4" label="Select" color="text-yellow-400" />
              <div className="mt-4 px-1">
                <p className="text-[10px] text-muted-foreground text-center italic leading-tight opacity-70">
                  {t('modal.controlsNote') || '*Vai trò (Nhảy/Đánh/...) của A/B tùy thuộc vào từng game'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - ESC Hint only */}
        <div className="flex items-center justify-center px-4 py-2 bg-[#111] border-t border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs text-rose-400">ESC</kbd>
            <span className="text-muted-foreground">{t('modal.back') || 'Quay lại'}</span>
          </div>
          {/* Mobile hint */}
          <span className="md:hidden text-xs text-muted-foreground ml-4">
            ({t('modal.rotateForControls') || 'Xoay ngang để xem phím'})
          </span>
        </div>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onBackToLogin={() => {
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}

// Vertical Control Hint Component for sidebars
function ControlHintVertical({ keys, label, color = 'text-white' }: { keys: string; label: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <kbd className={`px-2 py-1 rounded bg-white/10 font-mono text-xs ${color}`}>
        {keys}
      </kbd>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
