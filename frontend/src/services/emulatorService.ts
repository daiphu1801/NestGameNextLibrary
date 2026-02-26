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

// ============================================================
// GAMEPAD CONFIG
// ============================================================
export interface GamepadButtonMap {
  up: number;      // D-Pad or axis
  down: number;
  left: number;
  right: number;
  a: number;       // NES A button
  b: number;       // NES B button
  start: number;
  select: number;
  useAxis: boolean; // true = use axes for D-Pad instead of buttons
}

export interface GamepadConfig {
  p1: GamepadButtonMap;
  p2: GamepadButtonMap;
}

// Standard Xbox/PlayStation mapping (W3C Gamepad API standard)
// Xbox: A=0, B=1, X=2, Y=3, LB=4, RB=5, LT=6, RT=7, Back/Select=8, Start=9
// D-Pad: up=12, down=13, left=14, right=15
// PS:   Cross=0, Circle=1, Square=2, Triangle=3, ...
export const DEFAULT_GAMEPAD_MAPPING: GamepadConfig = {
  p1: {
    up: 12,
    down: 13,
    left: 14,
    right: 15,
    b: 0,    // A(Xbox)/Cross(PS) → NES B
    a: 1,    // B(Xbox)/Circle(PS) → NES A
    start: 9,
    select: 8,
    useAxis: false,
  },
  p2: {
    up: 12,
    down: 13,
    left: 14,
    right: 15,
    b: 0,
    a: 1,
    start: 9,
    select: 8,
    useAxis: false,
  },
};

class EmulatorService {
  private currentEmulator: any = null;
  private isLoading = false;
  private _isOfflineMode = false;
  private readonly KEYBINDINGS_KEY = 'nestgame_keybindings';
  private readonly GAMEPAD_KEY = 'nestgame_gamepad';

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

  // ---- Gamepad mapping helpers ----

  getGamepadMapping(): GamepadConfig {
    if (typeof window === 'undefined') return DEFAULT_GAMEPAD_MAPPING;
    try {
      const stored = localStorage.getItem(this.GAMEPAD_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          p1: { ...DEFAULT_GAMEPAD_MAPPING.p1, ...(parsed.p1 || {}) },
          p2: { ...DEFAULT_GAMEPAD_MAPPING.p2, ...(parsed.p2 || {}) },
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_GAMEPAD_MAPPING;
  }

  async saveGamepadMapping(config: GamepadConfig): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.GAMEPAD_KEY, JSON.stringify(config));
  }

  /** Returns the first connected gamepad or null */
  detectGamepad(): Gamepad | null {
    if (typeof navigator === 'undefined') return null;
    const pads = navigator.getGamepads();
    for (const pad of pads) {
      if (pad && pad.connected) return pad;
    }
    return null;
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

      // Get gamepad mapping
      const gp = this.getGamepadMapping();

      // Launch emulator with canvas, keyboard + gamepad controls
      this.currentEmulator = await Nostalgist.nes({
        rom: romUrl,
        element: canvas,
        retroarchConfig: {
          // ── Keyboard: Player 1 ──
          input_player1_up: keys.p1.up,
          input_player1_down: keys.p1.down,
          input_player1_left: keys.p1.left,
          input_player1_right: keys.p1.right,
          input_player1_a: keys.p1.a,
          input_player1_b: keys.p1.b,
          input_player1_start: keys.p1.start,
          input_player1_select: keys.p1.select,

          // ── Keyboard: Player 2 ──
          input_player2_up: keys.p2.up,
          input_player2_down: keys.p2.down,
          input_player2_left: keys.p2.left,
          input_player2_right: keys.p2.right,
          input_player2_a: keys.p2.a,
          input_player2_b: keys.p2.b,
          input_player2_start: keys.p2.start,
          input_player2_select: keys.p2.select,

          // ── Gamepad: Player 1 ──
          input_player1_joypad_index: 0,
          input_player1_b_btn: String(gp.p1.b),
          input_player1_a_btn: String(gp.p1.a),
          input_player1_up_btn: String(gp.p1.up),
          input_player1_down_btn: String(gp.p1.down),
          input_player1_left_btn: String(gp.p1.left),
          input_player1_right_btn: String(gp.p1.right),
          input_player1_start_btn: String(gp.p1.start),
          input_player1_select_btn: String(gp.p1.select),

          // ── Gamepad: Player 2 ──
          input_player2_joypad_index: 1,
          input_player2_b_btn: String(gp.p2.b),
          input_player2_a_btn: String(gp.p2.a),
          input_player2_up_btn: String(gp.p2.up),
          input_player2_down_btn: String(gp.p2.down),
          input_player2_left_btn: String(gp.p2.left),
          input_player2_right_btn: String(gp.p2.right),
          input_player2_start_btn: String(gp.p2.start),
          input_player2_select_btn: String(gp.p2.select),
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
