import { useState, useCallback } from 'react';
import { useCombo } from '@/hooks/useCombo';
import type { ComboDefinition, ComboStep, ComboSlots } from '@/types/combo';
import type { NESButton } from '@/types/emulator';
import { comboService } from '@/services/comboService';
const BUTTON_LABELS: Record<string, string> = {
  up: '↑', down: '↓', left: '←', right: '→',
  a: 'A', b: 'B', x: 'X', y: 'Y', l: 'L', r: 'R',
};

export function useComboEditor() {
    const { config, combos: p1Combos, allCombos, updateSlots, addCustomCombo, removeCustomCombo, reload } = useCombo('p1');
    const [activeTab, setActiveTab] = useState<'slots' | 'custom'>('slots');
    const [editingCombo, setEditingCombo] = useState<ComboDefinition | null>(null);
    const [testingSlot, setTestingSlot] = useState<number | null>(null);

    const handleSlotChange = useCallback((player: 'p1' | 'p2', slotIndex: number, comboId: string) => {
        const currentSlots = player === 'p1' ? [...config.p1Slots] : [...config.p2Slots];
        currentSlots[slotIndex] = comboId;
        updateSlots(currentSlots as ComboSlots);
    }, [config, updateSlots]);

    const handleTestCombo = useCallback(async (slotIndex: number, player: 'p1' | 'p2') => {
        setTestingSlot(slotIndex);
        await comboService.executeSlot(slotIndex, player);
        setTestingSlot(null);
    }, []);

    const startNewCombo = useCallback(() => {
        setEditingCombo({
            id: `custom_${Date.now()}`,
            name: 'New Combo',
            nameVi: 'Combo mới',
            icon: '⚔️',
            motionDisplay: '',
            isPreset: false,
            steps: [{ buttons: ['down'], duration: 50 }],
        });
    }, []);

    const updateStep = useCallback((stepIndex: number, field: keyof ComboStep, value: any) => {
        if (!editingCombo) return;
        const newSteps = [...editingCombo.steps];
        newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
        setEditingCombo({ ...editingCombo, steps: newSteps });
    }, [editingCombo]);

    const toggleStepButton = useCallback((stepIndex: number, button: NESButton) => {
        if (!editingCombo) return;
        const newSteps = [...editingCombo.steps];
        const step = newSteps[stepIndex];
        const buttons = step.buttons.includes(button)
            ? step.buttons.filter(b => b !== button)
            : [...step.buttons, button];
        newSteps[stepIndex] = { ...step, buttons };
        setEditingCombo({ ...editingCombo, steps: newSteps });
    }, [editingCombo]);

    const addStep = useCallback(() => {
        if (!editingCombo) return;
        setEditingCombo({
            ...editingCombo,
            steps: [...editingCombo.steps, { buttons: [], duration: 50 }],
        });
    }, [editingCombo]);

    const removeStep = useCallback((index: number) => {
        if (!editingCombo || editingCombo.steps.length <= 1) return;
        const newSteps = editingCombo.steps.filter((_, i) => i !== index);
        setEditingCombo({ ...editingCombo, steps: newSteps });
    }, [editingCombo]);

    const saveCombo = useCallback(() => {
        if (!editingCombo) return;
        const motionDisplay = editingCombo.steps
            .map(s => s.buttons.map(b => BUTTON_LABELS[b] || b).join('+'))
            .filter(Boolean)
            .join(' → ');
        addCustomCombo({ ...editingCombo, motionDisplay });
        setEditingCombo(null);
        reload();
    }, [editingCombo, addCustomCombo, reload]);

    return {
        config,
        allCombos,
        activeTab,
        setActiveTab,
        editingCombo,
        setEditingCombo,
        testingSlot,
        handleSlotChange,
        handleTestCombo,
        startNewCombo,
        updateStep,
        toggleStepButton,
        addStep,
        removeStep,
        saveCombo,
        removeCustomCombo,
        reload
    };
}
