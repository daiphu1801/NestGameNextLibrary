import type { NESButton } from '@/types/emulator';

// ============================================================
// COMBO SYSTEM — Type Definitions
// ============================================================

/** A single step in a combo sequence */
export interface ComboStep {
  /** Buttons to hold simultaneously during this step */
  buttons: NESButton[];
  /** How long (ms) to hold before moving to the next step */
  duration: number;
}

/** A complete combo definition */
export interface ComboDefinition {
  id: string;
  name: string;
  nameVi: string;
  icon: string;
  /** Visual description of the motion (e.g. "↓ ↘ → + A") */
  motionDisplay: string;
  steps: ComboStep[];
  /** Whether this is a built-in preset or user-created */
  isPreset: boolean;
}

/** Player combo slot assignments (6 slots per player) */
export type ComboSlots = [string, string, string, string, string, string]; // 6 combo IDs

/** Full combo configuration stored in localStorage */
export interface ComboConfig {
  p1Slots: ComboSlots;
  p2Slots: ComboSlots;
  customCombos: ComboDefinition[];
}

/** Keyboard shortcuts for combo slots */
export interface ComboKeyboardShortcuts {
  p1: [string, string, string, string, string, string]; // RetroArch key names
  p2: [string, string, string, string, string, string];
}
