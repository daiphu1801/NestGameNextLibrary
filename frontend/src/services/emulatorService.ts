import { env } from '@/config/env';

interface EmulatorOptions {
  rom: string;
  core?: string;
  size?: {
    width: number;
    height: number;
  };
}

import { userService } from './userService';

interface PlayerKeys {
  up: string;
  down: string;
  left: string;
  right: string;
  a: string;
  b: string;
  start: string;
  select: string;
}

export interface KeybindingConfig {
  p1: PlayerKeys;
  p2: PlayerKeys;
}

export const DEFAULT_KEYBINDINGS: KeybindingConfig = {
  p1: {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
    a: 'j',
    b: 'k',
    start: 'enter',
    select: 'rshift',
  },
  p2: {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
    a: 'num1',
    b: 'num2',
    start: 'num3',
    select: 'num4',
  },
};

class EmulatorService {
  private currentEmulator: any = null;
  private isLoading = false;
  private _isOfflineMode = false;
  private readonly KEYBINDINGS_KEY = 'nestgame_keybindings';

  /**
   * Get current keybindings
   * Priority: LocalStorage -> Default
   * (User profile sync happens on login/init, so LocalStorage should be up to date)
   */
  getKeybindings(): KeybindingConfig {
    if (typeof window === 'undefined') return DEFAULT_KEYBINDINGS;

    try {
      const stored = localStorage.getItem(this.KEYBINDINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          p1: { ...DEFAULT_KEYBINDINGS.p1, ...(parsed.p1 || {}) },
          p2: { ...DEFAULT_KEYBINDINGS.p2, ...(parsed.p2 || {}) },
        };
      }
    } catch (error) {
      console.error('Failed to parse keybindings from storage', error);
    }
    return DEFAULT_KEYBINDINGS;
  }

  /**
   * Save keybindings
   * Saves to LocalStorage immediately and tries to sync with Backend if logged in
   */
  async saveKeybindings(config: KeybindingConfig): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const jsonConfig = JSON.stringify(config);
      localStorage.setItem(this.KEYBINDINGS_KEY, jsonConfig);

      // Try to sync with backend
      try {
        await userService.updateKeybindings(jsonConfig);
      } catch (err) {
        // Silently fail if not logged in or network error - local storage is primary source for now
        console.warn('Failed to sync keybindings to server:', err);
      }

    } catch (error) {
      console.error('Failed to save keybindings:', error);
      throw error;
    }
  }

  /**
   * Get the ROM URL - tries local API first, falls back to R2
   */
  private async getRomUrl(gamePath: string): Promise<string> {
    const cleanPath = gamePath.startsWith('/') ? gamePath.slice(1) : gamePath;
    const localApiUrl = `/api/roms/${encodeURIComponent(cleanPath)}`;

    try {
      // Try to fetch from local API first
      const response = await fetch(localApiUrl, { method: 'HEAD' });

      if (response.ok) {
        console.log('✅ ROM found locally:', cleanPath);
        this._isOfflineMode = true;
        return localApiUrl;
      }
    } catch (error) {
      console.log('⚠️ Local ROM check failed, trying online...');
    }

    // Fallback to R2 cloud URL
    if (!env.r2Url) {
      throw new Error('No R2 URL configured and ROM not found locally');
    }

    const baseUrl = env.r2Url.endsWith('/') ? env.r2Url : `${env.r2Url}/`;
    const r2Url = `${baseUrl}${cleanPath}`;
    console.log('🌐 Loading ROM from cloud:', r2Url);
    this._isOfflineMode = false;
    return r2Url;
  }

  /**
   * Check if currently running in offline mode
   */
  get isOfflineMode(): boolean {
    return this._isOfflineMode;
  }

  async loadGame(gamePath: string, container: HTMLElement): Promise<void> {
    // Skip if already loading
    if (this.isLoading) {
      console.log('Game is already loading, skipping...');
      return;
    }

    this.isLoading = true;

    try {
      // Unload previous game if any
      if (this.currentEmulator) {
        await this.unload();
      }

      // Dynamic import Nostalgist
      const { Nostalgist } = await import('nostalgist');

      // Get ROM URL (tries local first, then R2)
      const romUrl = await this.getRomUrl(gamePath);
      console.log('Loading ROM from:', romUrl);

      // Clear container and create canvas
      container.innerHTML = '';
      const canvas = document.createElement('canvas');
      canvas.className = 'emulator-canvas';

      // Force canvas to fill container width while maintaining aspect ratio
      canvas.style.cssText = `
        width: 100% !important;
        height: auto !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
        display: block !important;
        margin: 0 auto !important;
      `;

      container.appendChild(canvas);

      // Get custom keybindings
      const keys = this.getKeybindings();

      // Launch emulator with canvas and custom keyboard controls
      this.currentEmulator = await Nostalgist.nes({
        rom: romUrl,
        element: canvas,
        retroarchConfig: {
          // Player 1 Controls (Custom)
          input_player1_up: keys.p1.up,
          input_player1_down: keys.p1.down,
          input_player1_left: keys.p1.left,
          input_player1_right: keys.p1.right,
          input_player1_a: keys.p1.a,
          input_player1_b: keys.p1.b,
          input_player1_start: keys.p1.start,
          input_player1_select: keys.p1.select,

          // Player 2 Controls (Custom)
          input_player2_up: keys.p2.up,
          input_player2_down: keys.p2.down,
          input_player2_left: keys.p2.left,
          input_player2_right: keys.p2.right,
          input_player2_a: keys.p2.a,
          input_player2_b: keys.p2.b,
          input_player2_start: keys.p2.start,
          input_player2_select: keys.p2.select,
        },
      });

      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error('Failed to load game:', error);
      throw error;
    }
  }

  async unload(): Promise<void> {
    if (this.currentEmulator) {
      try {
        await this.currentEmulator.exit();
        this.currentEmulator = null;
      } catch (error) {
        console.error('Failed to unload emulator:', error);
      }
    }
  }

  pause(): void {
    if (this.currentEmulator) {
      this.currentEmulator.pause();
    }
  }

  resume(): void {
    if (this.currentEmulator) {
      this.currentEmulator.resume();
    }
  }

  restart(): void {
    if (this.currentEmulator) {
      this.currentEmulator.restart();
    }
  }

  async saveState(): Promise<{ state: Blob; thumbnail?: Blob } | null> {
    if (this.currentEmulator) {
      return await this.currentEmulator.saveState();
    }
    return null;
  }

  async loadState(state: Blob): Promise<void> {
    if (this.currentEmulator) {
      await this.currentEmulator.loadState(state);
    }
  }

  isGameLoaded(): boolean {
    return this.currentEmulator !== null;
  }

  getLoadingState(): boolean {
    return this.isLoading;
  }
}

export const emulatorService = new EmulatorService();
