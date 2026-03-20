import type { ComboDefinition, ComboConfig, ComboSlots } from '@/types/combo';
import type { NESButton } from '@/types/emulator';
import { emulatorService } from '@/services/emulatorService';
import { PRESET_COMBOS, DEFAULT_COMBO_SLOTS } from '@/data/comboPresets';

// ============================================================
// COMBO SERVICE — Execution engine + configuration persistence
// ============================================================

const STORAGE_KEY = 'nestgame_combo_config';

class ComboService {
  private executing = false;
  private abortController: AbortController | null = null;

  // ── Configuration ────────────────────────────────────────

  /** Load combo config from localStorage, fallback to defaults */
  getConfig(): ComboConfig {
    if (typeof window === 'undefined') {
      return { p1Slots: [...DEFAULT_COMBO_SLOTS], p2Slots: [...DEFAULT_COMBO_SLOTS], customCombos: [] };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ComboConfig;
        
        // Pad with defaults if the saved array is shorter than DEFAULT_COMBO_SLOTS
        const padSlots = (saved: string[] | undefined): ComboSlots => {
          if (!saved) return [...DEFAULT_COMBO_SLOTS];
          const padded = [...saved];
          for (let i = padded.length; i < DEFAULT_COMBO_SLOTS.length; i++) {
            padded.push(DEFAULT_COMBO_SLOTS[i]);
          }
          return padded as ComboSlots;
        };

        return {
          p1Slots: padSlots(parsed.p1Slots),
          p2Slots: padSlots(parsed.p2Slots),
          customCombos: parsed.customCombos || [],
        };
      }
    } catch (error) {
      console.error('Failed to parse combo config:', error);
    }

    return { p1Slots: [...DEFAULT_COMBO_SLOTS], p2Slots: [...DEFAULT_COMBO_SLOTS], customCombos: [] };
  }

  /** Save combo config to localStorage */
  saveConfig(config: ComboConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save combo config:', error);
    }
  }

  // ── Combo Resolution ─────────────────────────────────────

  /** Get all available combos: presets + custom */
  getAllCombos(): ComboDefinition[] {
    const config = this.getConfig();
    return [...PRESET_COMBOS, ...config.customCombos];
  }

  /** Find a combo by ID */
  getComboById(id: string): ComboDefinition | undefined {
    return this.getAllCombos().find(c => c.id === id);
  }

  /** Get the 4 assigned combos for a player */
  getPlayerCombos(player: 'p1' | 'p2'): (ComboDefinition | undefined)[] {
    const config = this.getConfig();
    const slots = player === 'p1' ? config.p1Slots : config.p2Slots;
    return slots.map(id => this.getComboById(id));
  }

  // ── Custom Combo Management ──────────────────────────────

  /** Add a custom combo and save */
  addCustomCombo(combo: ComboDefinition): void {
    const config = this.getConfig();
    // Ensure unique ID
    const existing = config.customCombos.findIndex(c => c.id === combo.id);
    if (existing >= 0) {
      config.customCombos[existing] = combo;
    } else {
      config.customCombos.push({ ...combo, isPreset: false });
    }
    this.saveConfig(config);
  }

  /** Remove a custom combo by ID */
  removeCustomCombo(id: string): void {
    const config = this.getConfig();
    config.customCombos = config.customCombos.filter(c => c.id !== id);
    // Remove from slots if assigned
    config.p1Slots = config.p1Slots.map(s => s === id ? DEFAULT_COMBO_SLOTS[0] : s) as ComboSlots;
    config.p2Slots = config.p2Slots.map(s => s === id ? DEFAULT_COMBO_SLOTS[0] : s) as ComboSlots;
    this.saveConfig(config);
  }

  /** Update slot assignments for a player */
  updateSlots(player: 'p1' | 'p2', slots: ComboSlots): void {
    const config = this.getConfig();
    if (player === 'p1') config.p1Slots = slots;
    else config.p2Slots = slots;
    this.saveConfig(config);
  }

  // ── Execution Engine ─────────────────────────────────────

  /** Whether a combo is currently executing */
  get isExecuting(): boolean {
    return this.executing;
  }

  /** Cancel any currently executing combo */
  cancelExecution(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.executing = false;
  }

  /**
   * Execute a combo sequence using Nostalgist's native pressDown/pressUp API.
   * Each step: press buttons → wait duration → release → next step.
   */
  async executeCombo(combo: ComboDefinition, player: 'p1' | 'p2' = 'p1'): Promise<void> {
    if (this.executing) return; // Prevent double-trigger

    // Get the Nostalgist emulator instance
    const emu = emulatorService.getEmulator();
    if (!emu) {
      console.warn('[Combo] No emulator instance available');
      return;
    }

    this.executing = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const playerNum = player === 'p1' ? 1 : 2;

    // Track all currently held buttons so we can release them between steps
    let heldButtons: NESButton[] = [];

    try {
      for (const step of combo.steps) {
        if (signal.aborted) break;

        // Release buttons that are NOT in the current step
        const toRelease = heldButtons.filter(b => !step.buttons.includes(b));
        for (const btn of toRelease) {
          try { emu.pressUp({ button: btn, player: playerNum }); } catch {}
        }

        // Press buttons that are NEW in the current step
        const toPress = step.buttons.filter(b => !heldButtons.includes(b));
        for (const btn of toPress) {
          try { emu.pressDown({ button: btn, player: playerNum }); } catch {}
        }

        heldButtons = [...step.buttons];

        // Wait for the step duration
        if (step.duration > 0) {
          await this.delay(step.duration, signal);
        }
      }

      // Release all remaining buttons
      for (const btn of heldButtons) {
        try { emu.pressUp({ button: btn, player: playerNum }); } catch {}
      }
    } catch {
      // Aborted — release all buttons
      for (const btn of heldButtons) {
        try { emu.pressUp({ button: btn, player: playerNum }); } catch {}
      }
    } finally {
      this.executing = false;
      this.abortController = null;
    }
  }

  /**
   * Execute combo by slot index (0-5) for a player.
   * Convenience method for UI components.
   */
  async executeSlot(slotIndex: number, player: 'p1' | 'p2' = 'p1'): Promise<void> {
    const combos = this.getPlayerCombos(player);
    const combo = combos[slotIndex];
    if (combo) {
      await this.executeCombo(combo, player);
    }
  }

  // ── Internal Helpers ─────────────────────────────────────

  /** Delay with abort support */
  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  }
}

export const comboService = new ComboService();
