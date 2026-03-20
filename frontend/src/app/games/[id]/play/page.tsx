'use client';

import { Loader2, AlertCircle, LogIn, Gamepad2, X } from 'lucide-react';
import { GameLoadingOverlay } from '@/components/game/GameLoadingOverlay';
import { LoginModal, RegisterModal } from '@/components/auth';
import { PlayTutorialPanel, ControlsPanel, HotGamesPanel } from '@/components/game/PlayTutorialPanel';
import { GameTutorial } from '@/components/game/GameTutorial';
import { MobileControlsOverlay } from '@/components/mobile/MobileControlsOverlay';
import { ExitOverlay } from '@/components/mobile/ExitOverlay';
import { PortraitOverlay } from '@/components/mobile/PortraitOverlay';
import { PlayHeader } from '@/components/game/PlayHeader';
import { PlaySaveModal } from '@/components/game/PlaySaveModal';
import { FlashPlayer } from '@/components/game/FlashPlayer';
import { usePlayPage } from '@/features/emulator/hooks/usePlayPage';
import { usePlaySaveState } from '@/features/emulator/hooks/usePlaySaveState';
import { cn } from '@/lib/utils';

export default function PlayPage() {
  const {
    containerRef, pageRef,
    game, isLoading, error, isFullscreen, showControls,
    hotGames, isControlsCollapsed, setIsControlsCollapsed,
    isHotGamesCollapsed, setIsHotGamesCollapsed,
    showMobileTutorial, setShowMobileTutorial,
    showTutorial, setShowTutorial,
    trialTimeLeft, isTrialEnded,
    showLoginModal, setShowLoginModal,
    showRegisterModal, setShowRegisterModal,
    isFavorite, isZapper, isMobile,
    loadGameEmulator, handleFavoriteToggle, toggleFullscreen, handleSwitchGame,
    user, t, locale, router, unlock,
    flashGameUrl
  } = usePlayPage();

  const saveState = usePlaySaveState(game, user);

  // Initial loading
  if (isLoading && !game) {
    return (
      <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-white">{t('game.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className={isMobile ? "game-container bg-black flex flex-col relative" : "h-screen bg-black flex flex-col relative overflow-hidden"}
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none hidden lg:block">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>

      {/* Trial Timer */}
      {!user && !isTrialEnded && !error && (
        <div className={cn(
          "absolute z-[60] animate-in fade-in slide-in-from-top-2 duration-300",
          isMobile ? "top-2 right-2" : "top-16 left-1/2 -translate-x-1/2"
        )}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/25 backdrop-blur-md shadow-lg shadow-yellow-500/5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-xs font-bold text-yellow-400 whitespace-nowrap">
              {t('trial.active', { seconds: trialTimeLeft }) || `Trial: ${trialTimeLeft}s`}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <PlayHeader
        game={game}
        isFavorite={isFavorite}
        isFullscreen={isFullscreen}
        isLoading={isLoading}
        error={error}
        showControls={showControls}
        isMobile={isMobile}
        user={user}
        t={t}
        onBack={() => router.back()}
        onFavoriteToggle={handleFavoriteToggle}
        onToggleFullscreen={toggleFullscreen}
        onOpenSave={() => saveState.openSaveModal('save')}
        onOpenLoad={() => saveState.openSaveModal('load')}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT — Controls */}
        {!isFullscreen && game?.system !== 'flash' && (
          <div className="hidden lg:block">
            <ControlsPanel
              system={game?.system}
              isZapper={isZapper}
              isCollapsed={isControlsCollapsed}
              onToggleCollapse={() => setIsControlsCollapsed(!isControlsCollapsed)}
            />
          </div>
        )}

        {/* CENTER — Game Canvas */}
        <div className="flex-1 flex items-center justify-center bg-black relative transition-all duration-300 overflow-hidden">
          {isLoading && game && (
            <GameLoadingOverlay game={game} onClose={() => router.back()} />
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
              <p className="text-lg font-medium text-white">{t('modal.loadFailed')}</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button
                onClick={loadGameEmulator}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
              >
                {t('modal.tryAgain')}
              </button>
            </div>
          )}

          {/* Trial Ended */}
          {isTrialEnded && !user && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-20">
              <div className="relative p-8 bg-[#0F0F23] border border-purple-500/30 rounded-2xl shadow-2xl max-w-md w-full text-center mx-4">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogIn className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('trial.loginRequired')}</h3>
                <p className="text-muted-foreground mb-8">
                  {t('trial.desc', { gameName: game?.name || '' }) || `Your trial has ended. Login to continue playing ${game?.name || 'this game'}.`}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                  >
                    {t('trial.loginToContinue')}
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    {t('trial.closeGame')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Emulator Container (RetroArch or Flash) */}
          {game?.system === 'flash' ? (
            <div className="w-full h-full max-w-5xl max-h-[80vh] p-4 lg:p-8 mx-auto my-auto transition-all animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center">
              <FlashPlayer gameUrl={flashGameUrl || undefined} />
            </div>
          ) : (
            <div
              ref={containerRef}
              className="w-full h-full flex items-center justify-center overflow-hidden"
              tabIndex={0}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          )}

          {/* Mobile Controls */}
          {isMobile && game?.system !== 'flash' && (
            <>
              <MobileControlsOverlay enabled={!isLoading && !error && !isTrialEnded} system={game?.system} />
              <ExitOverlay
                onExit={() => { unlock(); router.back(); }}
                onSave={user && !isLoading && !error ? () => saveState.openSaveModal('save') : undefined}
                onLoad={user && !isLoading && !error ? () => saveState.openSaveModal('load') : undefined}
                gameName={game?.name}
              />
              <PortraitOverlay />
            </>
          )}
        </div>

        {/* RIGHT — Hot Games */}
        {!isFullscreen && (
          <div className="hidden lg:block">
            <HotGamesPanel
              hotGames={hotGames}
              onGameClick={(gameId) => handleSwitchGame(gameId.toString())}
              isCollapsed={isHotGamesCollapsed}
              onToggleCollapse={() => setIsHotGamesCollapsed(!isHotGamesCollapsed)}
            />
          </div>
        )}

        {/* Mobile Tutorial Drawer */}
        {!isFullscreen && !isMobile && (
          <>
            <button
              onClick={() => setShowMobileTutorial(true)}
              className={cn(
                "lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95",
                showMobileTutorial && "scale-0"
              )}
            >
              <Gamepad2 className="w-6 h-6" />
            </button>

            {showMobileTutorial && (
              <>
                <div
                  className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                  onClick={() => setShowMobileTutorial(false)}
                />
                <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[75vh] animate-in slide-in-from-bottom duration-300">
                  <div className="relative flex flex-col bg-gradient-to-br from-[#0F0F23] via-[#1a1a2e] to-[#0F0F23] border-t border-purple-500/30 rounded-t-3xl shadow-2xl">
                    <div className="flex items-center justify-center py-3">
                      <div className="w-12 h-1.5 rounded-full bg-white/20" />
                    </div>
                    <button
                      onClick={() => setShowMobileTutorial(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex-1 overflow-auto max-h-[calc(75vh-5rem)]">
                      <PlayTutorialPanel
                        system={game?.system}
                        isZapper={isZapper}
                        hotGames={hotGames}
                        onGameClick={(gameId) => {
                          handleSwitchGame(gameId.toString());
                          setShowMobileTutorial(false);
                        }}
                        isCollapsed={false}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Bottom Control Hints */}
      {!isMobile && game?.system !== 'flash' && (
        <div
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
            !showControls && !isFullscreen && "translate-y-16 opacity-0"
          )}
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono text-[10px] font-semibold border border-rose-500/20">ESC</kbd>
              <span className="text-[10px] text-slate-500">{t('modal.back')}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="hidden sm:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono text-[10px] font-semibold border border-white/[0.08]">WASD</kbd>
              <span className="text-[10px] text-slate-500">{t('docs.controls.movement') || 'Move'}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono text-[10px] font-semibold border border-white/[0.08]">J/K</kbd>
              <span className="text-[10px] text-slate-500">A/B</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono text-[10px] font-semibold border border-white/[0.08]">Enter</kbd>
              <span className="text-[10px] text-slate-500">Start</span>
            </div>
          </div>
        </div>
      )}

      {/* Save/Load Modal */}
      {saveState.showSaveModal && (
        <PlaySaveModal
          mode={saveState.saveModalMode}
          saveSlots={saveState.saveSlots}
          savingSlot={saveState.savingSlot}
          saveStatus={saveState.saveStatus}
          locale={saveState.locale}
          t={t}
          onClose={() => saveState.setShowSaveModal(false)}
          onSave={saveState.handleSaveToSlot}
          onLoad={saveState.handleLoadFromSlot}
          onDelete={saveState.handleDeleteSlot}
        />
      )}

      {/* Tutorial */}
      <GameTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        modalRef={pageRef}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
        onForgotPassword={() => { }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
      />
    </div>
  );
}
