'use client';

import { useState, useCallback, useEffect } from 'react';
import { comboService } from '@/services/comboService';
import type { ComboDefinition, ComboConfig, ComboSlots } from '@/types/combo';

// ============================================================
// useCombo — React hook for combo system integration
// ============================================================

interface UseComboReturn {
  /** The 4 assigned combos for this player */
  combos: (ComboDefinition | undefined)[];
  /** Execute a combo by slot index (0-3) */
  execute: (slotIndex: number) => Promise<void>;
  /** Whether a combo is currently executing */
  isExecuting: boolean;
  /** Full config for settings UI */
  config: ComboConfig;
  /** Update slot assignments */
  updateSlots: (slots: ComboSlots) => void;
  /** All available combos (presets + custom) */
  allCombos: ComboDefinition[];
  /** Add a custom combo */
  addCustomCombo: (combo: ComboDefinition) => void;
  /** Remove a custom combo */
  removeCustomCombo: (id: string) => void;
  /** Reload config from storage */
  reload: () => void;
}

export function useCombo(player: 'p1' | 'p2' = 'p1'): UseComboReturn {
  const [config, setConfig] = useState<ComboConfig>(() => comboService.getConfig());
  const [isExecuting, setIsExecuting] = useState(false);

  // Reload config from storage
  const reload = useCallback(() => {
    setConfig(comboService.getConfig());
  }, []);

  // Reload on mount
  useEffect(() => { reload(); }, [reload]);

  // Get assigned combos for this player
  const combos = (player === 'p1' ? config.p1Slots : config.p2Slots)
    .map(id => comboService.getComboById(id));

  // Execute combo by slot
  const execute = useCallback(async (slotIndex: number) => {
    if (isExecuting) return;
    const combo = combos[slotIndex];
    if (!combo) return;

    setIsExecuting(true);
    try {
      await comboService.executeCombo(combo, player);
    } finally {
      setIsExecuting(false);
    }
  }, [combos, isExecuting, player]);

  // Update slots
  const updateSlots = useCallback((slots: ComboSlots) => {
    comboService.updateSlots(player, slots);
    setConfig(comboService.getConfig());
  }, [player]);

  // Custom combos
  const addCustomCombo = useCallback((combo: ComboDefinition) => {
    comboService.addCustomCombo(combo);
    setConfig(comboService.getConfig());
  }, []);

  const removeCustomCombo = useCallback((id: string) => {
    comboService.removeCustomCombo(id);
    setConfig(comboService.getConfig());
  }, []);

  return {
    combos,
    execute,
    isExecuting,
    config,
    updateSlots,
    allCombos: comboService.getAllCombos(),
    addCustomCombo,
    removeCustomCombo,
    reload,
  };
}
