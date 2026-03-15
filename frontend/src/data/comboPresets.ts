import type { ComboDefinition, ComboSlots, ComboKeyboardShortcuts } from '@/types/combo';

// ============================================================
// UNIVERSAL FIGHTING GAME COMBO PRESETS
// Works across: SF2, DBZ, KOF, Fatal Fury, Samurai Shodown, etc.
// ============================================================

export const PRESET_COMBOS: ComboDefinition[] = [
  {
    id: 'qcf',
    name: 'Quarter Circle Forward',
    nameVi: 'Phóng chiêu tới',
    icon: '🔥',
    motionDisplay: '↓ ↘ → + Y',
    isPreset: true,
    steps: [
      { buttons: ['down'], duration: 67 },
      { buttons: ['down', 'right'], duration: 67 },
      { buttons: ['right'], duration: 67 },
      { buttons: ['right', 'y'], duration: 100 },
      { buttons: [], duration: 0 }, // release all
    ],
  },
  {
    id: 'dp',
    name: 'Dragon Punch',
    nameVi: 'Thăng long quyền',
    icon: '⚡',
    motionDisplay: '→ ↓ ↘ → + Y',
    isPreset: true,
    steps: [
      { buttons: ['right'], duration: 67 },
      { buttons: ['down'], duration: 67 },
      { buttons: ['down', 'right'], duration: 67 },
      { buttons: ['right', 'y'], duration: 100 },
      { buttons: [], duration: 0 },
    ],
  },
  {
    id: 'qcb',
    name: 'Quarter Circle Back',
    nameVi: 'Phóng chiêu lùi',
    icon: '🌀',
    motionDisplay: '↓ ↙ ← + B',
    isPreset: true,
    steps: [
      { buttons: ['down'], duration: 67 },
      { buttons: ['down', 'left'], duration: 67 },
      { buttons: ['left'], duration: 67 },
      { buttons: ['left', 'b'], duration: 100 },
      { buttons: [], duration: 0 },
    ],
  },
  {
    id: 'hcf',
    name: 'Half Circle Forward',
    nameVi: 'Nửa vòng tới',
    icon: '💨',
    motionDisplay: '← ↙ ↓ ↘ → + A',
    isPreset: true,
    steps: [
      { buttons: ['left'], duration: 50 },
      { buttons: ['down', 'left'], duration: 50 },
      { buttons: ['down'], duration: 50 },
      { buttons: ['down', 'right'], duration: 50 },
      { buttons: ['right'], duration: 50 },
      { buttons: ['right', 'a'], duration: 100 },
      { buttons: [], duration: 0 },
    ],
  },
  {
    id: 'double_qcf',
    name: 'Double QCF (Super)',
    nameVi: 'Siêu chiêu (2x QCF)',
    icon: '💥',
    motionDisplay: '↓↘→ ↓↘→ + Y',
    isPreset: true,
    steps: [
      // First QCF
      { buttons: ['down'], duration: 67 },
      { buttons: ['down', 'right'], duration: 67 },
      { buttons: ['right'], duration: 67 },
      // Neutral gap — game needs this to recognize 2 separate motions
      { buttons: [], duration: 33 },
      // Second QCF
      { buttons: ['down'], duration: 67 },
      { buttons: ['down', 'right'], duration: 67 },
      { buttons: ['right'], duration: 67 },
      // Attack button: Press all 3 Punches (Y + X + L) to ensure Level 3 Super (Max meter)
      { buttons: ['right', 'y', 'x', 'l'], duration: 100 },
      { buttons: [], duration: 0 },
    ],
  },
  {
    id: 'double_qcb_lv3',
    name: 'Super QCB (Lv3)',
    nameVi: 'Siêu lốc (Lv3)',
    icon: '🌪️',
    motionDisplay: '↓↙← ↓↙← + 3K',
    isPreset: true,
    steps: [
      // First QCB
      { buttons: ['down'], duration: 50 },
      { buttons: ['down', 'left'], duration: 50 },
      { buttons: ['left'], duration: 50 },
      // Neutral gap
      { buttons: [], duration: 33 },
      // Second QCB
      { buttons: ['down'], duration: 50 },
      { buttons: ['down', 'left'], duration: 50 },
      { buttons: ['left'], duration: 50 },
      // Attack button: Press all 3 Kicks (A + B + R). Removed directional key here to ensure clean input.
      { buttons: ['a', 'b', 'r'], duration: 100 },
      { buttons: [], duration: 0 },
    ],
  },
];

/** Default slot assignments for new users (6 slots) */
export const DEFAULT_COMBO_SLOTS: ComboSlots = ['qcf', 'dp', 'qcb', 'hcf', 'double_qcf', 'double_qcb_lv3'];

/** Keyboard shortcuts per player (6 slots) */
export const COMBO_KEYBOARD_SHORTCUTS: ComboKeyboardShortcuts = {
  p1: ['t', 'y', 'g', 'h', 'b', 'n'],
  p2: ['keypad0', 'keypad9', 'kp_plus', 'kp_minus', 'kp_multiply', 'kp_divide'],
};

/** Short labels for combo buttons (mobile UI) */
export const COMBO_SLOT_LABELS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] as const;
