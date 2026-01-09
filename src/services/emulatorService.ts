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

      // Construct ROM URL - ensure proper slash between base URL and path
      const baseUrl = env.r2Url.endsWith('/') ? env.r2Url : `${env.r2Url}/`;
      const cleanPath = gamePath.startsWith('/') ? gamePath.slice(1) : gamePath;
      const romUrl = `${baseUrl}${cleanPath}`;
      console.log('Loading ROM from:', romUrl);

      // Clear container and create canvas
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

      // Launch emulator with canvas
      this.currentEmulator = await Nostalgist.nes({
        rom: romUrl,
        element: canvas,
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
