import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Game } from '@/types';
import { gameService } from '@/services/gameService';
import { emulatorService } from '@/services/emulatorService';
import { storageService } from '@/services/storageService';
import { userService } from '@/services/userService';
import { comboService } from '@/services/comboService';
import { COMBO_KEYBOARD_SHORTCUTS } from '@/data/comboPresets';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLoading } from '@/components/providers/LoadingProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useFavorites } from '@/components/providers/FavoritesProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';

export function usePlayPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const { showToast } = useToast();
  const { isFavorite: checkIsFavorite, toggleFavorite: toggleFav } = useFavorites();
  const { isLoading: globalIsLoading, setIsLoading: setGlobalLoading } = useLoading();

  const isMobile = useMobileDetection();
  const { lockLandscape, unlock } = useScreenOrientation();

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hotGames, setHotGames] = useState<Game[]>([]);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [isHotGamesCollapsed, setIsHotGamesCollapsed] = useState(false);
  const [showMobileTutorial, setShowMobileTutorial] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [trialTimeLeft, setTrialTimeLeft] = useState(10);
  const [isTrialEnded, setIsTrialEnded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [flashGameUrl, setFlashGameUrl] = useState<string | null>(null);
  const [j2meGameUrl, setJ2meGameUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isFavorite = game ? checkIsFavorite(game.id) : false;
  const isZapper = game?.inputDevice === 'zapper' || (game?.system === 'nes' && !!game?.name && emulatorService.isZapperGame(game.name));

  // Load game data
  const loadGameData = useCallback(async () => {
    try {
      setIsLoading(true);
      setGlobalLoading?.(true);

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
      const featured = gameService.getFeaturedGames(6);
      setHotGames(featured.filter(g => g.id !== gameData.id).slice(0, 5));
    } catch (error) {
      console.error('Failed to load game:', error);
      showToast(t('errors.gameNotFound'), 'error');
      router.push('/library');
    } finally {
      setIsLoading(false);
      setGlobalLoading?.(false);
    }
  }, [params.id]);

  // Load game into emulator
  const loadGameEmulator = useCallback(async () => {
    if (!game?.path) {
      setError('Game path not found');
      return;
    }

    // Skip nostalgic emulator loading for flash games, as they use Ruffle
    if (game.system === 'flash') {
      setIsLoading(false);
      setGlobalLoading?.(false);
      storageService.addRecentGame(game.id);
      if (user) {
        userService.recordPlayHistory(game.id).catch(err => {
          console.error('Failed to record play history:', err);
        });
      }
      try {
        const resolvedUrl = await emulatorService.getRomUrl(game.path);
        setFlashGameUrl(resolvedUrl);
      } catch (err) {
        setError('Không thể tìm thấy đường dẫn tệp màn chơi Flash.');
      }
      return;
    }

    // Skip nostalgic emulator loading for J2ME games, as they use J2ME-For-Web
    if (game.system === 'j2me') {
      setIsLoading(false);
      setGlobalLoading?.(false);
      storageService.addRecentGame(game.id);
      if (user) {
        userService.recordPlayHistory(game.id).catch(err => {
          console.error('Failed to record play history:', err);
        });
      }
      try {
        // Use the direct ROM URL (R2/Cloudinary) since the emulator runs on R2 (cross-origin)
        // and can fetch from any URL without COEP restrictions.
        const resolvedUrl = await emulatorService.getRomUrl(game.path);
        setJ2meGameUrl(resolvedUrl);
      } catch (err) {
        setError('Không thể tìm thấy đường dẫn tệp game Java.');
      }
      return;
    }

    if (!containerRef.current) {
      return;
    }

    setIsLoading(true);
    setGlobalLoading?.(true);
    setError(null);

    try {
      await emulatorService.loadGame(game.path, game.system || 'nes', containerRef.current, {
        gameName: game.name,
        inputDevice: game.inputDevice,
      });
      storageService.addRecentGame(game.id);

      if (user) {
        await userService.recordPlayHistory(game.id).catch(err => {
          console.error('Failed to record play history:', err);
        });
      }

      setIsLoading(false);
      setGlobalLoading?.(false);

      const tutorialSeen = localStorage.getItem('nestgame_tutorial_seen');
      if (!tutorialSeen) {
        setTimeout(() => setShowTutorial(true), 500);
      }
    } catch (err: any) {
      console.error('Failed to load game:', err);
      setError(err?.message || 'Failed to load game. Please check your configuration.');
      setIsLoading(false);
      setGlobalLoading?.(false);
    }
  }, [game, user]);

  // Favorite toggle
  const handleFavoriteToggle = useCallback(async () => {
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
  }, [game, isFavorite, toggleFav, showToast, t]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!pageRef.current) return;
    if (!document.fullscreenElement) {
      await pageRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  // Switch game
  const handleSwitchGame = useCallback((gameId: string) => {
    emulatorService.unload();
    router.push(`/games/${gameId}/play`);
  }, [router]);

  // ── Effects ──

  useEffect(() => { loadGameData(); }, [params.id]);

  useEffect(() => {
    if (game && containerRef.current && game.system !== 'flash' && game.system !== 'j2me') {
      loadGameEmulator();
    } else if (game?.system === 'flash' || game?.system === 'j2me') {
      loadGameEmulator(); // Just records history and stops loading state
    }
    return () => { emulatorService.unload(); };
  }, [game]);

  useEffect(() => {
    if (game && isMobile && !isLoading && !error) lockLandscape();
    return () => { if (isMobile) unlock(); };
  }, [game, isMobile, isLoading, error, lockLandscape, unlock]);

  // Trial timer
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [user, isLoading, isTrialEnded, error, game]);

  // Auto-hide controls
  useEffect(() => {
    const resetHideTimer = () => {
      setShowControls(true);
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = setTimeout(() => {
        if (!showLoginModal && !showRegisterModal) setShowControls(false);
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
  }, [showLoginModal, showRegisterModal]);

  // Fullscreen change
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) document.exitFullscreen?.();
        else if (confirm(t('play.confirmExit') || 'Bạn có chắc muốn thoát?')) router.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, router, t]);

  // Combo shortcuts
  useEffect(() => {
    const isAdvanced = game?.system === 'snes' || game?.system === 'gba';
    if (!isAdvanced || isLoading || error || isMobile) return;

    const comboKeyMap: Record<string, { player: 'p1' | 'p2'; slot: number }> = {};
    COMBO_KEYBOARD_SHORTCUTS.p1.forEach((key, i) => {
      comboKeyMap[key] = { player: 'p1', slot: i };
    });
    const p2CodeMap: Record<string, number> = {
      'Numpad0': 0, 'Numpad9': 1, 'NumpadAdd': 2, 'NumpadSubtract': 3,
      'NumpadMultiply': 4, 'NumpadDivide': 5,
    };

    const handleComboKey = (e: KeyboardEvent) => {
      if (showLoginModal || showRegisterModal) return;
      const p1Key = e.key.toLowerCase();
      if (comboKeyMap[p1Key]) {
        e.preventDefault();
        comboService.executeSlot(comboKeyMap[p1Key].slot, comboKeyMap[p1Key].player);
        return;
      }
      if (p2CodeMap[e.code] !== undefined) {
        e.preventDefault();
        comboService.executeSlot(p2CodeMap[e.code], 'p2');
      }
    };

    window.addEventListener('keydown', handleComboKey);
    return () => window.removeEventListener('keydown', handleComboKey);
  }, [game?.system, isLoading, error, isMobile, showLoginModal, showRegisterModal]);

  return {
    // Refs
    containerRef, pageRef,
    // State
    game, isLoading, error, isFullscreen, showControls,
    hotGames, isControlsCollapsed, setIsControlsCollapsed,
    isHotGamesCollapsed, setIsHotGamesCollapsed,
    showMobileTutorial, setShowMobileTutorial,
    showTutorial, setShowTutorial,
    trialTimeLeft, isTrialEnded,
    showLoginModal, setShowLoginModal,
    showRegisterModal, setShowRegisterModal,
    isFavorite, isZapper, isMobile,
    flashGameUrl,
    j2meGameUrl,
    // Actions
    loadGameEmulator, handleFavoriteToggle, toggleFullscreen, handleSwitchGame,
    // Context
    user, t, locale, router, unlock,
  };
}
