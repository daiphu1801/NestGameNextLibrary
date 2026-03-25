import { EmulatorOptions, KeybindingConfig, PlayerKeys, GamepadConfig, GamepadButtonMap, NESButton } from '@/types/emulator';
// Re-export types for backward compatibility
export type { EmulatorOptions, KeybindingConfig, PlayerKeys, GamepadConfig, GamepadButtonMap, NESButton };
import { env } from '@/config/env';



import { userService } from './userService';





export const DEFAULT_KEYBINDINGS: KeybindingConfig = {
  p1: {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
    a: 'k',
    b: 'j',
    x: 'i',
    y: 'u',
    l: 'o',
    r: 'l',
    start: 'enter',
    select: 'rshift',
  },
  p2: {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
    a: 'keypad2',
    b: 'keypad1',
    x: 'keypad5',
    y: 'keypad4',
    l: 'keypad6',
    r: 'keypad3',
    start: 'keypad7',
    select: 'keypad8',
  },
};

// ============================================================
// GAMEPAD CONFIG
// ============================================================




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
    y: 2,    // X(Xbox)/Square(PS) → SNES Y
    x: 3,    // Y(Xbox)/Triangle(PS) → SNES X
    l: 4,    // LB(Xbox)/L1(PS) → SNES L
    r: 5,    // RB(Xbox)/R1(PS) → SNES R
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
    y: 2,
    x: 3,
    l: 4,
    r: 5,
    start: 9,
    select: 8,
    useAxis: false,
  },
};



class EmulatorService {
  private currentEmulator: any = null;
  private isLoading = false;
  private currentLoadId = 0;
  private _isOfflineMode = false;
  private readonly KEYBINDINGS_KEY = 'nestgame_keybindings';
  private readonly GAMEPAD_KEY = 'nestgame_gamepad';
  private readonly VOLUME_KEY = 'nestgame_volume';
  private _volume = 1.0; // 0.0 to 1.0
  private _gainNode: GainNode | null = null;

  // Danh sách game NES sử dụng Zapper (Light Gun)
  private readonly ZAPPER_GAMES = [
    'duck hunt',
    'hogan\'s alley',
    'wild gunman',
    'barker bill\'s trick shooting',
    'bayou billy',
    'freedom force',
    'gotcha',
    'gumshoe',
    'laser invasion',
    'mechanized attack',
    'operation wolf',
    'shooting range',
    'to the earth',
  ];

  isZapperGame(gameName: string): boolean {
    const name = gameName.toLowerCase();
    return this.ZAPPER_GAMES.some(z => name.includes(z));
  }

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
        const parsed = JSON.parse(stored) as KeybindingConfig;

        // Migration: Standardize P2 numpad keys to 'keypadX' format (RetroArch config format)
        const migrate = (keys: PlayerKeys) => {
          const newKeys = { ...keys };
          (Object.keys(newKeys) as (keyof PlayerKeys)[]).forEach(k => {
            const val = newKeys[k];
            if (typeof val === 'string') {
              // Đã đúng format 'keypadX' → giữ nguyên
              if (/^keypad\d$/.test(val)) return;
              // Chuyển 'numpadX', 'numX', 'kpX', 'NumpadX' → 'keypadX'
              const numpadMatch = val.match(/^(?:numpad|num|kp|Numpad)(\d)$/i);
              if (numpadMatch) {
                newKeys[k] = `keypad${numpadMatch[1]}`;
              }
            }
          });
          return newKeys;
        };

        return {
          p1: parsed.p1 || DEFAULT_KEYBINDINGS.p1,
          p2: migrate(parsed.p2 || DEFAULT_KEYBINDINGS.p2),
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
   * Get the ROM URL
   * Priority: Cloudinary URL (proxied) → local API → R2 fallback
   */
  async getRomUrl(gamePath: string): Promise<string> {
    // For Vercel Production, passing large ROMs through /api/roms/proxy often hits
    // the 4.5MB payload limit or 10s Serverless Function timeout, resulting in a broken zip.
    // Since Cloudflare R2 now has CORS configured, we will load Cloudinary/R2 URLs DIRECTLY
    // instead of proxying them.
    
    if (gamePath.startsWith('https://res.cloudinary.com/')) {
      console.log('☁️ Loading ROM direct from Cloudinary:', gamePath);
      this._isOfflineMode = false;
      return gamePath;
    }

    if (/^https:\/\/pub-[a-z0-9]+\.r2\.dev\//.test(gamePath)) {
      console.log('☁️ Loading ROM direct from R2:', gamePath);
      this._isOfflineMode = false;
      return gamePath;
    }

    // Other full URLs (CDN, etc.): use directly
    if (gamePath.startsWith('http://') || gamePath.startsWith('https://')) {
      console.log('🌐 Loading ROM from full URL:', gamePath);
      this._isOfflineMode = false;
      return gamePath;
    }

    // Relative path: try local API first
    const cleanPath = gamePath.startsWith('/') ? gamePath.slice(1) : gamePath;
    const localApiUrl = `/api/roms/${encodeURIComponent(cleanPath)}`;

    try {
      const response = await fetch(localApiUrl, { method: 'HEAD' });
      if (response.ok) {
        //console.log('✅ ROM found locally:', cleanPath);
        this._isOfflineMode = true;
        return localApiUrl;
      }
    } catch (error) {
      //console.log('⚠️ Local ROM check failed, trying online...');
    }

    // Fallback to R2 cloud URL
    if (!env.r2Url) {
      throw new Error('No R2 URL configured and ROM not found locally');
    }

    const baseUrl = env.r2Url.endsWith('/') ? env.r2Url : `${env.r2Url}/`;
    const r2Url = `${baseUrl}${cleanPath}`;
    this._isOfflineMode = false;
    return r2Url;
  }

  /**
   * Check if currently running in offline mode
   */
  get isOfflineMode(): boolean {
    return this._isOfflineMode;
  }

  async loadGame(gamePath: string, system: string = 'nes', container: HTMLElement, options?: { gameName?: string; inputDevice?: 'zapper' | 'standard' }): Promise<void> {
    // Cancel any previous pending load and start a new one.
    // This prevents a "stuck" state where subsequent calls are ignored.
    const loadId = ++this.currentLoadId;
    this.isLoading = true;
    console.log('[emulatorService] loadGame start', { gamePath, system, loadId });

    try {
      // Unload previous game if any
      if (this.currentEmulator) {
        await this.unload();
      }

      if (this.currentLoadId !== loadId) {
        this.isLoading = false;
        return;
      }

      // Dynamic import Nostalgist
      const { Nostalgist } = await import('nostalgist');

      if (this.currentLoadId !== loadId) {
        this.isLoading = false;
        return;
      }

      // Get ROM URL (tries local first, then R2)
      const romUrl = await this.getRomUrl(gamePath);
      //console.log('[emulatorService] romUrl resolved', romUrl);

      if (this.currentLoadId !== loadId) {
        this.isLoading = false;
        return;
      }

      //console.log('Loading ROM from:', romUrl);

      // Clear container and create canvas
      container.innerHTML = '';
      const canvas = document.createElement('canvas');
      canvas.className = 'emulator-canvas';

      // Force canvas to fill container width while maintaining aspect ratio
      // Detect Zapper / Light Gun game
      const isZapper = options?.inputDevice === 'zapper' ||
        (system === 'nes' && options?.gameName ? this.isZapperGame(options.gameName) : false);

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
        ${isZapper ? 'cursor: crosshair !important;' : ''}
      `;

      container.appendChild(canvas);
      // Log canvas/client sizes for debugging
      try {
        const rect = container.getBoundingClientRect();
        console.log('[emulatorService] container size', { width: rect.width, height: rect.height });
      } catch (err) {
        // ignore
      }

      // Get custom keybindings
      const keys = this.getKeybindings();

      // Get gamepad mapping
      const gp = this.getGamepadMapping();

      // Determine correct core for the system
      let core = 'fceumm'; // default NES
      if (system === 'snes') core = 'snes9x';
      else if (system === 'gba' || system === 'gb' || system === 'gbc') core = 'mgba';
      else if (system === 'genesis') core = 'genesis_plus_gx';
      else if (system === 'arcade') core = 'fbneo';
      else if (system === 'ps1' || system === 'psx') core = 'pcsx_rearmed';
      else if (system === 'psp') core = 'ppsspp';
      else if (system === 'saturn') core = 'beetle_saturn';

      if (this.currentLoadId !== loadId) {
        this.isLoading = false;
        return;
      }

      // Launch emulator with canvas, keyboard + gamepad controls
      this.currentEmulator = await Nostalgist.launch({
        core: core,
        rom: romUrl,
        element: canvas,
        retroarchCoreConfig: {
          ...(isZapper && core === 'fceumm' ? {
            fceumm_zapper_mode: 'touchscreen', // Touchscreen maps absolute mouse clicks perfectly bypassing CSS scale issues
            fceumm_show_crosshair: 'enabled'
          } : {})
        },
        retroarchConfig: {
          // ── Keyboard: Player 1 ──
          input_player1_up: keys.p1.up,
          input_player1_down: keys.p1.down,
          input_player1_left: keys.p1.left,
          input_player1_right: keys.p1.right,
          input_player1_a: keys.p1.a,
          input_player1_b: keys.p1.b,
          input_player1_x: keys.p1.x,
          input_player1_y: keys.p1.y,
          input_player1_l: keys.p1.l,
          input_player1_r: keys.p1.r,
          input_player1_start: keys.p1.start,
          input_player1_select: keys.p1.select,

          // ── Keyboard: Player 2 ──
          input_player2_up: keys.p2.up,
          input_player2_down: keys.p2.down,
          input_player2_left: keys.p2.left,
          input_player2_right: keys.p2.right,
          input_player2_a: keys.p2.a,
          input_player2_b: keys.p2.b,
          input_player2_x: keys.p2.x,
          input_player2_y: keys.p2.y,
          input_player2_l: keys.p2.l,
          input_player2_r: keys.p2.r,
          input_player2_start: keys.p2.start,
          input_player2_select: keys.p2.select,

          // ── Device Configuration ──
          // 258 = RETRO_DEVICE_ZAPPER (FCEUmm Port 2 Lightgun).
          input_libretro_device_p2: isZapper ? 258 : 1,

          // ── Joypad Mapping ──
          input_player1_joypad_index: 0,
          // Keyboard events for P2 are handled via keysym mapping. Explicitly setting P2 joypad index to 1
          // overrides keyboard bindings if no second pad is plugged in. Leaving it out lets the core use the mapped keys.

          // ── Gamepad: Player 1 Buttons ──
          input_player1_b_btn: String(gp.p1.b),
          input_player1_a_btn: String(gp.p1.a),
          input_player1_x_btn: String(gp.p1.x),
          input_player1_y_btn: String(gp.p1.y),
          input_player1_l_btn: String(gp.p1.l),
          input_player1_r_btn: String(gp.p1.r),
          input_player1_up_btn: String(gp.p1.up),
          input_player1_down_btn: String(gp.p1.down),
          input_player1_left_btn: String(gp.p1.left),
          input_player1_right_btn: String(gp.p1.right),
          input_player1_start_btn: String(gp.p1.start),
          input_player1_select_btn: String(gp.p1.select),

          // ── Gamepad: Player 2 Buttons ──
          input_player2_b_btn: String(gp.p2.b),
          input_player2_a_btn: String(gp.p2.a),
          input_player2_x_btn: String(gp.p2.x),
          input_player2_y_btn: String(gp.p2.y),
          input_player2_l_btn: String(gp.p2.l),
          input_player2_r_btn: String(gp.p2.r),
          input_player2_up_btn: String(gp.p2.up),
          input_player2_down_btn: String(gp.p2.down),
          input_player2_left_btn: String(gp.p2.left),
          input_player2_right_btn: String(gp.p2.right),
          input_player2_start_btn: String(gp.p2.start),
          input_player2_select_btn: String(gp.p2.select),

          // ── Zapper / Light Gun Mouse Mapping ──
          ...(isZapper ? {
            input_player2_mouse_index: '0'
          } : {}),
        },
      });

      console.log('[emulatorService] emulator launched successfully', { loadId });

      // Setup volume control after emulator launches
      setTimeout(() => {
        this.setupAudioGain();
        this.setVolume(this.getVolume());
      }, 500);
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      // Ensure no emulator reference remains
      this.currentEmulator = null;
      console.error('[emulatorService] Failed to load game:', error);
      
      let errorMsg = 'Failed to load game. Please check your configuration.';
      const errMsgStr = error?.message || String(error);
      
      if (errMsgStr.includes('Failed to fetch') || errMsgStr.includes('NetworkError')) {
          errorMsg = 'Lỗi kết nối mạng hoặc không tải được ROM. Có thể do trình duyệt chặn CORS (thử dùng trình duyệt khác).';
      } else if (errMsgStr.includes('SharedArrayBuffer')) {
          errorMsg = 'Trình duyệt của bạn không hỗ trợ SharedArrayBuffer (bắt buộc cho giả lập). Hãy dùng Chrome/Edge/Firefox bản mới nhất.';
      } else if (errMsgStr.includes('core')) {
          errorMsg = 'Không tải được lõi giả lập (Core). Vui lòng kiểm tra lại kết nối mạng.';
      }
      
      throw new Error(errorMsg);
    }
  }

  async unload(): Promise<void> {
    // Cancel any pending loads
    this.currentLoadId++;
    // Ensure loading flag is cleared when unloading
    this.isLoading = false;

    if (this.currentEmulator) {
      try {
        // Clear any canvas elements created by the emulator
        const canvas = document.querySelector('canvas.emulator-canvas');
        if (canvas && canvas.parentElement) {
          canvas.parentElement.innerHTML = '';
        }
        await this.currentEmulator.exit();
        this.currentEmulator = null;
      } catch (error) {
        console.error('Failed to unload emulator:', error);
        this.currentEmulator = null;
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
    // Ruffle Flash Load
    if (document.querySelector('ruffle-player, ruffle-embed')) {
      const state = await this.exportFlashSaves();
      if (state) {
        let thumbnail: Blob | undefined = undefined;
        try {
          const ruffleNode = document.querySelector('ruffle-player, ruffle-embed') as any;
          if (ruffleNode && ruffleNode.shadowRoot) {
             const canvas = ruffleNode.shadowRoot.querySelector('canvas');
             if (canvas) {
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                const res = await fetch(dataUrl);
                thumbnail = await res.blob();
             }
          }
        } catch(e) {
          console.warn('Could not capture flash thumbnail', e);
        }
        return { state, thumbnail };
      }
    }
    return null;
  }

  async loadState(state: Blob): Promise<void> {
    if (this.currentEmulator) {
      await this.currentEmulator.loadState(state);
      return;
    }
    // Ruffle Flash Load
    if (document.querySelector('ruffle-player, ruffle-embed')) {
      await this.importFlashSaves(state);
      // Reload page to apply changes for Flash
      window.location.reload();
      return;
    }
  }

  // ============================================================
  // FLASH GAME SAVES (IndexedDB)
  // ============================================================
  
  private serializeRuffleData(data: any): string {
    return JSON.stringify(data, (key, val) => {
      if (val && typeof val === 'object') {
        if (val.constructor && val.constructor.name === 'Uint8Array') {
          return { __type: 'Uint8Array', data: Array.from(val as Uint8Array) };
        }
        if (val.constructor && val.constructor.name === 'ArrayBuffer') {
          return { __type: 'ArrayBuffer', data: Array.from(new Uint8Array(val as ArrayBuffer)) };
        }
      }
      return val;
    });
  }

  private deserializeRuffleData(json: string): any {
    return JSON.parse(json, (key, val) => {
      if (val && typeof val === 'object') {
        if (val.__type === 'Uint8Array') return new Uint8Array(val.data);
        if (val.__type === 'ArrayBuffer') return new Uint8Array(val.data).buffer;
      }
      return val;
    });
  }

  private async exportFlashSaves(): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      try {
         const request = indexedDB.open('ruffle');
         request.onerror = () => reject(new Error("Failed to open ruffle IndexedDB"));
         request.onsuccess = (event: any) => {
           const db = event.target.result;
           const exportData: Record<string, Record<string, any>> = {};
           
           if (!db.objectStoreNames.length) {
             db.close();
             resolve(new Blob([this.serializeRuffleData(exportData)], { type: 'application/json' }));
             return;
           }
           
           const storeNames = Array.from(db.objectStoreNames) as string[];
           let completed = 0;
           
           storeNames.forEach(storeName => {
             exportData[storeName] = {};
             const tx = db.transaction(storeName, 'readonly');
             const store = tx.objectStore(storeName);
             const reqAll = store.getAll();
             const reqKeys = store.getAllKeys();
             
             reqAll.onsuccess = () => {
               reqKeys.onsuccess = () => {
                 const keys = reqKeys.result;
                 const values = reqAll.result;
                 for (let i = 0; i < keys.length; i++) {
                   exportData[storeName][keys[i]] = values[i];
                 }
                 completed++;
                 if (completed === storeNames.length) {
                   db.close();
                   const json = this.serializeRuffleData(exportData);
                   resolve(new Blob([json], { type: 'application/json' }));
                 }
               };
             };
             tx.onerror = (e: any) => reject(e);
           });
         };
      } catch (err: any) {
        reject(err);
      }
    });
  }

  private async importFlashSaves(blob: Blob): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const text = await blob.text();
        const importData = this.deserializeRuffleData(text);
        
        const request = indexedDB.open('ruffle');
        request.onerror = () => reject(new Error("Failed to open ruffle IndexedDB for import"));
        request.onsuccess = (event: any) => {
          const db = event.target.result;
          const storeNames = Array.from(db.objectStoreNames) as string[];
          
          if (storeNames.length === 0) {
            db.close();
            resolve();
            return;
          }
          
          let completed = 0;
          
          storeNames.forEach(storeName => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            
            // Clear current data first
            const reqClear = store.clear();
            reqClear.onsuccess = () => {
              if (importData[storeName]) {
                const keys = Object.keys(importData[storeName]);
                if (keys.length === 0) {
                  completed++;
                  if (completed === storeNames.length) {
                    db.close();
                    resolve();
                  }
                  return;
                }
                
                let putsCompleted = 0;
                keys.forEach(key => {
                  const reqPut = store.put(importData[storeName][key], key);
                  reqPut.onsuccess = () => {
                    putsCompleted++;
                    if (putsCompleted === keys.length) {
                      completed++;
                      if (completed === storeNames.length) {
                        db.close();
                        resolve();
                      }
                    }
                  };
                  reqPut.onerror = (err: any) => {
                    console.error("Failed to write key", key, err);
                    putsCompleted++;
                    if (putsCompleted === keys.length) {
                      completed++;
                      if (completed === storeNames.length) {
                        db.close();
                        resolve();
                      }
                    }
                  };
                });
              } else {
                completed++;
                if (completed === storeNames.length) {
                  db.close();
                  resolve();
                }
              }
            };
          });
        };
      } catch (err: any) {
        reject(err);
      }
    });
  }

  isGameLoaded(): boolean {
    return this.currentEmulator !== null;
  }

  getLoadingState(): boolean {
    return this.isLoading;
  }

  /**
   * Get the current emulator instance (for direct API access)
   */
  getEmulator(): any {
    return this.currentEmulator;
  }

  // ============================================================
  // VOLUME CONTROL
  // ============================================================

  /**
   * Get the current volume (0.0 to 1.0)
   */
  getVolume(): number {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.VOLUME_KEY);
      if (stored !== null) {
        this._volume = parseFloat(stored);
      }
    }
    return this._volume;
  }

  /**
   * Set the volume (0.0 to 1.0) and apply it immediately
   */
  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.VOLUME_KEY, String(this._volume));
    }
    // Apply via GainNode if available
    if (this._gainNode) {
      this._gainNode.gain.value = this._volume;
      return;
    }
    // Fallback: find all audio elements and set volume
    this._applyVolumeToAudioElements();
  }

  /**
   * Set up the audio gain node to intercept Web Audio output.
   * Call after emulator launches.
   */
  setupAudioGain(): void {
    try {
      // RetroArch WASM uses a global AudioContext. Find it.
      const ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!ctx) return;

      // Try to find the active AudioContext used by the emulator
      // Nostalgist / RetroArch stores the audio context in Module
      const moduleAudioCtx = (window as any).Module?.audioCtx || 
                             (window as any).Module?.SDL2?.audioContext ||
                             (window as any).AL?.currentCtx?.audioCtx;

      if (moduleAudioCtx && moduleAudioCtx.destination) {
        // Already has a gain node? Skip
        if (this._gainNode) {
          this._gainNode.gain.value = this._volume;
          return;
        }

        const gain = moduleAudioCtx.createGain();
        gain.gain.value = this.getVolume();
        gain.connect(moduleAudioCtx.destination);

        // Monkey-patch destination to redirect audio through our gain node
        const origConnect = AudioNode.prototype.connect;
        const dest = moduleAudioCtx.destination;
        AudioNode.prototype.connect = function(target: any, ...args: any[]): any {
          if (target === dest) {
            return origConnect.call(this, gain, ...args);
          }
          return origConnect.call(this, target, ...args);
        };

        this._gainNode = gain;
        return;
      }

      // Fallback: control HTML audio elements directly  
      this._applyVolumeToAudioElements();
    } catch (err) {
      console.warn('[emulatorService] Failed to setup audio gain:', err);
      this._applyVolumeToAudioElements();
    }
  }

  private _applyVolumeToAudioElements(): void {
    // Control any <audio> or <video> elements the emulator creates
    document.querySelectorAll('audio, video').forEach((el) => {
      (el as HTMLMediaElement).volume = this._volume;
    });
  }

  /**
   * Map NES button name to the keyboard key configured for player 1
   */
  private getKeyForButton(button: NESButton): string {
    const keys = this.getKeybindings();
    return keys.p1[button];
  }

  /**
   * Convert a RetroArch key name to a KeyboardEvent key/code
   */
  private retroKeyToKeyboard(retroKey: string): { key: string; code: string; keyCode: number } {
    const map: Record<string, { key: string; code: string; keyCode: number }> = {
      'w': { key: 'w', code: 'KeyW', keyCode: 87 },
      's': { key: 's', code: 'KeyS', keyCode: 83 },
      'a': { key: 'a', code: 'KeyA', keyCode: 65 },
      'd': { key: 'd', code: 'KeyD', keyCode: 68 },
      'j': { key: 'j', code: 'KeyJ', keyCode: 74 },
      'k': { key: 'k', code: 'KeyK', keyCode: 75 },
      'enter': { key: 'Enter', code: 'Enter', keyCode: 13 },
      'rshift': { key: 'Shift', code: 'ShiftRight', keyCode: 16 },
      'up': { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
      'down': { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
      'left': { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
      'right': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
      'space': { key: ' ', code: 'Space', keyCode: 32 },
      'digit8': { key: '8', code: 'Digit8', keyCode: 56 },
      'digit9': { key: '9', code: 'Digit9', keyCode: 57 },
      'keypad0': { key: '0', code: 'Numpad0', keyCode: 96 },
      'keypad1': { key: '1', code: 'Numpad1', keyCode: 97 },
      'keypad2': { key: '2', code: 'Numpad2', keyCode: 98 },
      'keypad3': { key: '3', code: 'Numpad3', keyCode: 99 },
      'keypad4': { key: '4', code: 'Numpad4', keyCode: 100 },
      'keypad5': { key: '5', code: 'Numpad5', keyCode: 101 },
      'keypad6': { key: '6', code: 'Numpad6', keyCode: 102 },
      'keypad7': { key: '7', code: 'Numpad7', keyCode: 103 },
      'keypad8': { key: '8', code: 'Numpad8', keyCode: 104 },
      'keypad9': { key: '9', code: 'Numpad9', keyCode: 105 },
    };
    return map[retroKey.toLowerCase()] || { key: retroKey, code: `Key${retroKey.toUpperCase()}`, keyCode: retroKey.charCodeAt(0) };
  }

  /**
   * Simulate a button press down via keyboard events on the canvas
   */
  pressButtonDown(button: NESButton): void {
    const retroKey = this.getKeyForButton(button);
    const { key, code, keyCode } = this.retroKeyToKeyboard(retroKey);

    const canvas = document.querySelector('canvas.emulator-canvas') as HTMLCanvasElement;
    const target = canvas || document;

    target.dispatchEvent(new KeyboardEvent('keydown', {
      key, code, keyCode, which: keyCode,
      bubbles: true, cancelable: true,
    }));
  }

  /**
   * Simulate a button release via keyboard events on the canvas
   */
  pressButtonUp(button: NESButton): void {
    const retroKey = this.getKeyForButton(button);
    const { key, code, keyCode } = this.retroKeyToKeyboard(retroKey);

    const canvas = document.querySelector('canvas.emulator-canvas') as HTMLCanvasElement;
    const target = canvas || document;

    target.dispatchEvent(new KeyboardEvent('keyup', {
      key, code, keyCode, which: keyCode,
      bubbles: true, cancelable: true,
    }));
  }
}

export const emulatorService = new EmulatorService();
