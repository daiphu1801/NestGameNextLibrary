import { useState } from 'react';
import { X, Maximize2, Minimize2, Save, FolderOpen } from 'lucide-react';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoginModal, RegisterModal, ForgotPasswordModal } from '@/components/auth';
import { GameTutorial } from './GameTutorial';
import { GameLoadingOverlay } from './GameLoadingOverlay';

// Extracted Features & Components
import { useGameEmulator } from '@/features/emulator/hooks/useGameEmulator';
import { useTrialMode } from '@/features/emulator/hooks/useTrialMode';
import { SaveStateModal } from '@/components/emulator/SaveStateModal';
import { ControlSidebar } from '@/components/emulator/ControlSidebar';
import { TrialEndedOverlay } from '@/components/emulator/TrialEndedOverlay';
import { EmulatorError } from '@/components/emulator/EmulatorError';
import { emulatorService } from '@/services/emulatorService';

interface GameModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const {
      containerRef,
      modalRef,
      isLoading,
      error,
      isFullscreen,
      showTutorial,
      setShowTutorial,
      loadGame,
      handleClose,
      toggleFullscreen
  } = useGameEmulator(game, isOpen, !!user, onClose);

  const { trialTimeLeft, isTrialEnded } = useTrialMode(isOpen, !!user, !!error, isLoading);

  // Auth Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Save State UI
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalMode, setSaveModalMode] = useState<'save' | 'load'>('save');

  const openSaveModal = (mode: 'save' | 'load') => {
    setSaveModalMode(mode);
    setShowSaveModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/95" onClick={handleClose} />

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
            <div className="flex items-center gap-2" data-tutorial="saveload">
              {user && !isLoading && !error ? (
                <>
                  <button
                    onClick={() => openSaveModal('save')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-sm text-emerald-400 border border-emerald-500/20"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('saveState.save') || 'Save'}</span>
                  </button>
                  <button
                    onClick={() => openSaveModal('load')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-sm text-blue-400 border border-blue-500/20"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('saveState.load') || 'Load'}</span>
                  </button>
                </>
              ) : !isLoading && !error ? (
                <>
                  <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 text-sm text-emerald-400/40 border border-emerald-500/10 cursor-not-allowed">
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('saveState.save') || 'Save'}</span>
                  </button>
                  <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 text-sm text-blue-400/40 border border-blue-500/10 cursor-not-allowed">
                    <FolderOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('saveState.load') || 'Load'}</span>
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-2" data-tutorial="tips">
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white border border-white/10"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{t('modal.fullscreen') || 'Fullscreen'}</span>
              </button>

              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors text-sm text-rose-400 border border-rose-500/20"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">{t('modal.close') || 'Đóng'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trial Timer Bar */}
        {!user && !isTrialEnded && !error && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 text-center">
            <p className="text-xs font-bold text-yellow-500 animate-pulse">
              {t('trial.active', { seconds: trialTimeLeft }) || `Trial Mode: ${trialTimeLeft}s remaining`}
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          <ControlSidebar player={1} />

          <div className="flex-1 relative bg-black min-w-0">
            {isLoading && <GameLoadingOverlay game={game} />}

            {error && (
              <EmulatorError 
                  error={error} 
                  onRetry={loadGame} 
                  onClose={handleClose} 
              />
            )}

            {isTrialEnded && !user && (
              <TrialEndedOverlay 
                  gameName={game.name} 
                  onLoginClick={() => setShowLoginModal(true)} 
                  onClose={handleClose} 
              />
            )}

            <div
              id="emulator-container"
              ref={containerRef}
              className="w-full h-full flex items-center justify-center bg-black"
              tabIndex={0}
            />
          </div>

          <ControlSidebar 
              player={2} 
              isZapper={game.inputDevice === 'zapper' || (game.system === 'nes' && game.name ? emulatorService.isZapperGame(game.name) : false)} 
          />
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-center px-4 py-2 bg-[#111] border-t border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs text-rose-400">ESC</kbd>
            <span className="text-muted-foreground">{t('modal.back') || 'Quay lại'}</span>
          </div>
          <span className="lg:hidden text-xs text-muted-foreground ml-4">
            ({t('modal.rotateForControls') || 'Xoay ngang để xem phím'})
          </span>
        </div>

        <GameTutorial
          isOpen={showTutorial}
          onClose={() => {
            setShowTutorial(false);
            containerRef.current?.focus();
          }}
          modalRef={modalRef}
        />
      </div>

      <SaveStateModal 
          isOpen={showSaveModal} 
          mode={saveModalMode} 
          gameId={game.id} 
          onClose={() => setShowSaveModal(false)} 
      />

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
