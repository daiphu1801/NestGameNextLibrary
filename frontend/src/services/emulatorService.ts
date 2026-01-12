import { env } from '@/config/env';

interface EmulatorOptions {
  rom: string;
  core?: string;
  size?: {
    width: number;
    height: number;
  };
}

class EmulatorService {
  private currentEmulator: any = null;
  private isLoading = false;
  private _isOfflineMode = false;

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

      // Force canvas to fill container with !important to prevent library overrides
      canvas.style.cssText = `
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
        image-rendering: pixelated;
        display: block !important;
      `;

      container.appendChild(canvas);

      // Launch emulator with canvas and custom keyboard controls
      // Player 1: WASD + J (A) + K (B) + Enter (Start) + Shift (Select)
      // Player 2: Arrow keys + 1 (A) + 2 (B) + 3 (Start) + 4 (Select)
      this.currentEmulator = await Nostalgist.nes({
        rom: romUrl,
        element: canvas,
        retroarchConfig: {
          // Player 1 Controls (WASD + JK)
          input_player1_up: 'w',
          input_player1_down: 's',
          input_player1_left: 'a',
          input_player1_right: 'd',
          input_player1_a: 'j',
          input_player1_b: 'k',
          input_player1_start: 'enter',
          input_player1_select: 'rshift',

          // Player 2 Controls (Arrow keys + 1/2)
          input_player2_up: 'up',
          input_player2_down: 'down',
          input_player2_left: 'left',
          input_player2_right: 'right',
          input_player2_a: 'num1',
          input_player2_b: 'num2',
          input_player2_start: 'num3',
          input_player2_select: 'num4',
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

  saveState(): void {
    if (this.currentEmulator) {
      this.currentEmulator.saveState();
    }
  }

  loadState(): void {
    if (this.currentEmulator) {
      this.currentEmulator.loadState();
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
