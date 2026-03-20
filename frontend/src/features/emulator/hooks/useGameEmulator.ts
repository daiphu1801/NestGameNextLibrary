import { useState, useEffect, useCallback, useRef } from 'react';
import { Game } from '@/types';
import { emulatorService } from '@/services/emulatorService';
import { storageService } from '@/services/storageService';
import { userService } from '@/services/userService';

export function useGameEmulator(game: Game, isOpen: boolean, isLoggedIn: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const loadGame = useCallback(async () => {
    if (!containerRef.current || !game.path) {
      setError('Game path not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await emulatorService.loadGame(game.path, game.system || 'nes', containerRef.current, {
        gameName: game.name,
        inputDevice: game.inputDevice,
      });
      
      if (!isOpen) {
        emulatorService.unload();
        return;
      }

      storageService.addRecentGame(game.id);

      if (isLoggedIn) {
        await userService.recordPlayHistory(game.id).catch(err => {
          console.error('Failed to record play history:', err);
        });
      }

      setIsLoading(false);

      const tutorialSeen = localStorage.getItem('nestgame_tutorial_seen');
      if (!tutorialSeen) {
        setShowTutorial(true);
      }

      containerRef.current?.focus();
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game. Please check your configuration.');
      setIsLoading(false);
    }
  }, [game.path, game.id, game.system, game.name, game.inputDevice, isOpen, isLoggedIn]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      loadGame();
    }
    return () => {
      emulatorService.unload();
    };
  }, [isOpen, game, loadGame]);

  const handleClose = useCallback(() => {
    emulatorService.unload();
    onClose();
  }, [onClose]);

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
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, handleClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement) {
      await modalRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return {
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
  };
}
