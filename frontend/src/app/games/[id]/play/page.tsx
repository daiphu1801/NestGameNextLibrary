'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Loader2, AlertCircle, Maximize2, Minimize2,
  Save, FolderOpen, X, Trash2, LogIn, Heart, Gamepad2
} from 'lucide-react';
import { Game } from '@/types';
import { gameService } from '@/services/gameService';
import { emulatorService } from '@/services/emulatorService';
import { saveStateService, SaveSlotInfo } from '@/services/saveStateService';
import { userService } from '@/services/userService';
import { storageService } from '@/services/storageService';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useFavorites } from '@/components/providers/FavoritesProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { LoginModal, RegisterModal } from '@/components/auth';
import { PlayTutorialPanel, ControlsPanel, HotGamesPanel } from '@/components/game/PlayTutorialPanel';
import { GameTutorial } from '@/components/game/GameTutorial';
import { MobileControlsOverlay } from '@/components/mobile/MobileControlsOverlay';
import { ExitOverlay } from '@/components/mobile/ExitOverlay';
import { PortraitOverlay } from '@/components/mobile/PortraitOverlay';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';
import { cn } from '@/lib/utils';

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const { showToast } = useToast();
  const { isFavorite: checkIsFavorite, toggleFavorite: toggleFav } = useFavorites();

  const isMobile = useMobileDetection();
  const { lockLandscape, unlock } = useScreenOrientation();

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Hot games recommendations
  const [hotGames, setHotGames] = useState<Game[]>([]);

  // Panel collapse states
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [isHotGamesCollapsed, setIsHotGamesCollapsed] = useState(false);
  const [showMobileTutorial, setShowMobileTutorial] = useState(false);

  // Tutorial pop-up state
  const [showTutorial, setShowTutorial] = useState(false);

  // Trial Mode State
  const [trialTimeLeft, setTrialTimeLeft] = useState(10);
  const [isTrialEnded, setIsTrialEnded] = useState(false);

  // Auth Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Save State UI
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalMode, setSaveModalMode] = useState<'save' | 'load'>('save');
  const [saveSlots, setSaveSlots] = useState<(SaveSlotInfo | null)[]>([null, null, null]);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isFavorite = game ? checkIsFavorite(game.id) : false;

  // Load game data
  useEffect(() => {
    loadGameData();
  }, [params.id]);

  // Load game into emulator
  useEffect(() => {
    if (game && containerRef.current) {
      loadGameEmulator();
    }

    return () => {
      emulatorService.unload();
    };
  }, [game]);

  // Mobile: auto-lock landscape when game starts
  useEffect(() => {
    if (game && isMobile && !isLoading && !error) {
      lockLandscape();
    }
    return () => {
      if (isMobile) unlock();
    };
  }, [game, isMobile, isLoading, error, lockLandscape, unlock]);

  // Trial Timer Logic
  useEffect(() => {
    if (!user && !isLoading && !isTrialEnded && !error && game) {
      timerRef.current = setInterval(() => {
        setTrialTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTrialEnded(true);
            emulatorService.unload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, isLoading, isTrialEnded, error, game]);

  // Auto-hide controls after 3s idle
  useEffect(() => {
    const resetHideTimer = () => {
      setShowControls(true);
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = setTimeout(() => {
        if (!showSaveModal && !showLoginModal && !showRegisterModal) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = () => resetHideTimer();
    const handleKeyDown = () => resetHideTimer();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    resetHideTimer();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [showSaveModal, showLoginModal, showRegisterModal]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else if (showSaveModal) {
          setShowSaveModal(false);
        } else {
          // Show confirmation before leaving
          if (confirm(t('play.confirmExit') || 'Bạn có chắc muốn thoát? Tiến trình chưa lưu sẽ mất.')) {
            router.back();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, showSaveModal, router, t]);

  const loadGameData = async () => {
    try {
      setIsLoading(true);

      // Load game by ID
      let allGames = gameService.getAllGames();
      if (allGames.length === 0) {
        allGames = await gameService.loadGames();
      }

      const gameData = await gameService.getGameById(params.id as string);
      if (!gameData) {
        showToast(t('errors.gameNotFound'), 'error');
        router.push('/library');
        return;
      }

      setGame(gameData);

      // Load hot games (exclude current game)
      const featured = gameService.getFeaturedGames(6);
      setHotGames(featured.filter(g => g.id !== gameData.id).slice(0, 5));
    } catch (error) {
      console.error('Failed to load game:', error);
      showToast(t('errors.gameNotFound'), 'error');
      router.push('/library');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameEmulator = async () => {
    if (!containerRef.current || !game?.path) {
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
        });
      }

      setIsLoading(false);

      // Show tutorial if first time
      const tutorialSeen = localStorage.getItem('nestgame_tutorial_seen');
      if (!tutorialSeen) {
        setTimeout(() => setShowTutorial(true), 500);
      }

      // Don't auto-focus to prevent auto-scroll
      // containerRef.current?.focus();
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game. Please check your configuration.');
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!game) return;
    try {
      await toggleFav(game.id);
      showToast(
        isFavorite ? t('game.removedFromFavorites') : t('game.addedToFavorites'),
        'success'
      );
    } catch (error) {
      showToast(t('errors.favoriteToggleFailed'), 'error');
    }
  };

  const toggleFullscreen = async () => {
    if (!pageRef.current) return;

    if (!document.fullscreenElement) {
      await pageRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  // ============ SAVE STATE HANDLERS ============

  const loadSlotInfo = useCallback(async () => {
    if (!user || !game?.id) return;
    try {
      const slots = await saveStateService.listSlots(game.id);
      const slotArray: (SaveSlotInfo | null)[] = [null, null, null];
      slots.forEach(s => {
        if (s.slot >= 1 && s.slot <= 3) slotArray[s.slot - 1] = s;
      });
      setSaveSlots(slotArray);
    } catch (err) {
      console.error('Failed to load save slots:', err);
    }
  }, [user, game?.id]);

  const openSaveModal = async (mode: 'save' | 'load') => {
    setSaveModalMode(mode);
    setSaveStatus(null);
    setShowSaveModal(true);
    await loadSlotInfo();
  };

  const handleSaveToSlot = async (slot: number) => {
    setSavingSlot(slot);
    setSaveStatus(null);
    try {
      const result = await emulatorService.saveState();
      if (!result) throw new Error(t('saveState.emulatorNotReady') || 'Emulator chưa sẵn sàng');

      await saveStateService.saveToServer(game!.id, slot, result.state, result.thumbnail);
      setSaveStatus({ type: 'success', message: t('saveState.saved', { slot }) || `Đã lưu vào Slot ${slot}!` });
      await loadSlotInfo();
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.saveFailed') || 'Lưu thất bại' });
    } finally {
      setSavingSlot(null);
    }
  };

  const handleLoadFromSlot = async (slot: number) => {
    setSavingSlot(slot);
    setSaveStatus(null);
    try {
      const stateBlob = await saveStateService.loadFromServer(game!.id, slot);
      await emulatorService.loadState(stateBlob);
      setSaveStatus({ type: 'success', message: t('saveState.loaded', { slot }) || `Đã tải Slot ${slot}!` });
      setTimeout(() => setShowSaveModal(false), 800);
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.loadFailed') || 'Tải thất bại' });
    } finally {
      setSavingSlot(null);
    }
  };

  const handleDeleteSlot = async (slot: number) => {
    setSavingSlot(slot);
    try {
      await saveStateService.deleteSlot(game!.id, slot);
      setSaveStatus({ type: 'success', message: t('saveState.deleted', { slot }) || `Đã xóa Slot ${slot}` });
      await loadSlotInfo();
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.deleteFailed') || 'Xóa thất bại' });
    } finally {
      setSavingSlot(null);
    }
  };

  const handleSwitchGame = (gameId: string) => {
    emulatorService.unload();
    router.push(`/games/${gameId}/play`);
  };

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
      {/* Subtle Ambient Glow — hidden on mobile for performance */}
      <div className="absolute inset-0 opacity-10 pointer-events-none hidden lg:block">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>

      {/* Floating Trial Timer Pill — repositioned on mobile */}
      {!user && !isTrialEnded && !error && (
        <div className={cn(
          "absolute z-[60] animate-in fade-in slide-in-from-top-2 duration-300",
          isMobile
            ? "top-2 right-2"
            : "top-16 left-1/2 -translate-x-1/2"
        )}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/25 backdrop-blur-md shadow-lg shadow-yellow-500/5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-xs font-bold text-yellow-400 whitespace-nowrap">
              {t('trial.active', { seconds: trialTimeLeft }) || `Trial: ${trialTimeLeft}s`}
            </p>
          </div>
        </div>
      )}

      {/* Top Header — hidden on mobile (use ExitOverlay tap instead) */}
      <header
        className={cn(
          "relative z-50 backdrop-blur-xl bg-[#0a0a1a]/90 border-b border-white/[0.06] transition-transform duration-300",
          !showControls && !isFullscreen && "-translate-y-full",
          isMobile && "hidden"
        )}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Left - Back Navigation */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">{t('common.back')}</span>
            </button>

            {/* Center - Game Title */}
            <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/10">
                <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h1 className="text-sm font-bold text-white truncate">{game?.name}</h1>
            </div>

            {/* Right - Controls */}
            <div className="flex items-center gap-2">
              {/* Favorite */}
              <button
                onClick={handleFavoriteToggle}
                className={cn(
                  "p-2 rounded-lg transition-all border",
                  isFavorite
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </button>

              {/* Save/Load */}
              <div className="flex items-center gap-2" data-tutorial="saveload">
                {user && !isLoading && !error ? (
                  <>
                    <button
                      onClick={() => openSaveModal('save')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-emerald-400 border border-emerald-500/15"
                      title={t('saveState.save')}
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:inline">{t('saveState.save')}</span>
                    </button>
                    <button
                      onClick={() => openSaveModal('load')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-blue-400 border border-blue-500/15"
                      title={t('saveState.load')}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:inline">{t('saveState.load')}</span>
                    </button>
                  </>
                ) : null}
              </div>

              {/* Fullscreen & Tips */}
              <div className="flex items-center gap-2" data-tutorial="tips">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-white border border-white/[0.06]"
                  title={t('modal.fullscreen')}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT — Controls Panel (Desktop only) */}
        {!isFullscreen && (
          <div className="hidden lg:block">
            <ControlsPanel
              isCollapsed={isControlsCollapsed}
              onToggleCollapse={() => setIsControlsCollapsed(!isControlsCollapsed)}
            />
          </div>
        )}

        {/* CENTER — Game Canvas */}
        <div
          className="flex-1 flex items-center justify-center bg-black relative transition-all duration-300 overflow-hidden"
        >
          {/* Loading State */}
          {isLoading && game && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
              <p className="text-lg font-medium text-white">{t('game.loading')}...</p>
            </div>
          )}

          {/* Error State */}
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

          {/* Trial Ended Overlay */}
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

          {/* Emulator Container */}
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden"
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />

          {/* Mobile Touch Controls */}
          {isMobile && (
            <>
              <MobileControlsOverlay
                enabled={!isLoading && !error && !isTrialEnded}
              />
              <ExitOverlay
                onExit={() => {
                  unlock();
                  router.back();
                }}
                onSave={user && !isLoading && !error ? () => openSaveModal('save') : undefined}
                onLoad={user && !isLoading && !error ? () => openSaveModal('load') : undefined}
                gameName={game?.name}
              />
              <PortraitOverlay />
            </>
          )}
        </div>

        {/* RIGHT — Hot Games Panel (Desktop only) */}
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

        {/* Mobile Floating Button — hide when touch controls are active */}
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

            {/* Mobile Bottom Drawer */}
            {showMobileTutorial && (
              <>
                {/* Backdrop */}
                <div
                  className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                  onClick={() => setShowMobileTutorial(false)}
                />

                {/* Drawer */}
                <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[75vh] animate-in slide-in-from-bottom duration-300">
                  <div className="relative flex flex-col bg-gradient-to-br from-[#0F0F23] via-[#1a1a2e] to-[#0F0F23] border-t border-purple-500/30 rounded-t-3xl shadow-2xl">
                    {/* Drawer Handle */}
                    <div className="flex items-center justify-center py-3">
                      <div className="w-12 h-1.5 rounded-full bg-white/20" />
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowMobileTutorial(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Content */}
                    <div className="flex-1 overflow-auto max-h-[calc(75vh-5rem)]">
                      <PlayTutorialPanel
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

      {/* Floating Bottom Control Hints — hidden on mobile (has virtual controls) */}
      {!isMobile && (
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
      {showSaveModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#0d0d1f] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {saveModalMode === 'save' ? (
                  <><Save className="w-5 h-5 text-emerald-400" /> {t('saveState.saveGame')}</>
                ) : (
                  <><FolderOpen className="w-5 h-5 text-blue-400" /> {t('saveState.loadGame')}</>
                )}
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Message */}
            {saveStatus && (
              <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${saveStatus.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}>
                {saveStatus.message}
              </div>
            )}

            {/* Slot List */}
            <div className="space-y-3">
              {[1, 2, 3].map((slot) => {
                const info = saveSlots[slot - 1];
                const isProcessing = savingSlot === slot;

                return (
                  <div
                    key={slot}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{t('saveState.slot')} {slot}</div>
                      {info ? (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(info.updatedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground/50 mt-0.5">{t('saveState.empty')}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {saveModalMode === 'save' ? (
                        <button
                          onClick={() => handleSaveToSlot(slot)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : info ? (t('saveState.overwrite')) : (t('saveState.save'))}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLoadFromSlot(slot)}
                          disabled={!info || isProcessing}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (t('saveState.load'))}
                        </button>
                      )}

                      {info && (
                        <button
                          onClick={() => handleDeleteSlot(slot)}
                          disabled={isProcessing}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all disabled:opacity-50"
                          title={t('saveState.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Game Tutorial Spotlight Overlay */}
      <GameTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        modalRef={pageRef}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onForgotPassword={() => { }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}
