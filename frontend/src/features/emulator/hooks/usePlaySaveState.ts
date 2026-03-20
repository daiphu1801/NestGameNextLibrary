import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { emulatorService } from '@/services/emulatorService';
import { saveStateService, SaveSlotInfo } from '@/services/saveStateService';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function usePlaySaveState(game: Game | null, user: any) {
  const { t, locale } = useLanguage();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalMode, setSaveModalMode] = useState<'save' | 'load'>('save');
  const [saveSlots, setSaveSlots] = useState<(SaveSlotInfo | null)[]>([null, null, null]);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadSlotInfo = useCallback(async () => {
    if (!user || !game?.id) return;
    try {
      const slots = await saveStateService.listSlots(game.id);
      const slotArray: (SaveSlotInfo | null)[] = [null, null, null];
      slots.forEach(s => {
        if (s.slot >= 1 && s.slot <= 3) slotArray[s.slot - 1] = s;
      });
      setSaveSlots(slotArray);
    } catch (err) {
      console.error('Failed to load save slots:', err);
    }
  }, [user, game?.id]);

  const openSaveModal = useCallback(async (mode: 'save' | 'load') => {
    setSaveModalMode(mode);
    setSaveStatus(null);
    setShowSaveModal(true);
    await loadSlotInfo();
  }, [loadSlotInfo]);

  const handleSaveToSlot = useCallback(async (slot: number) => {
    setSavingSlot(slot);
    setSaveStatus(null);
    try {
      const result = await emulatorService.saveState();
      if (!result) throw new Error(t('saveState.emulatorNotReady') || 'Emulator chưa sẵn sàng');
      await saveStateService.saveToServer(game!.id, slot, result.state, result.thumbnail);
      setSaveStatus({ type: 'success', message: t('saveState.saved', { slot }) || `Đã lưu vào Slot ${slot}!` });
      await loadSlotInfo();
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.saveFailed') || 'Lưu thất bại' });
    } finally {
      setSavingSlot(null);
    }
  }, [game, t, loadSlotInfo]);

  const handleLoadFromSlot = useCallback(async (slot: number) => {
    setSavingSlot(slot);
    setSaveStatus(null);
    try {
      const stateBlob = await saveStateService.loadFromServer(game!.id, slot);
      await emulatorService.loadState(stateBlob);
      setSaveStatus({ type: 'success', message: t('saveState.loaded', { slot }) || `Đã tải Slot ${slot}!` });
      setTimeout(() => setShowSaveModal(false), 800);
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.loadFailed') || 'Tải thất bại' });
    } finally {
      setSavingSlot(null);
    }
  }, [game, t]);

  const handleDeleteSlot = useCallback(async (slot: number) => {
    setSavingSlot(slot);
    try {
      await saveStateService.deleteSlot(game!.id, slot);
      setSaveStatus({ type: 'success', message: t('saveState.deleted', { slot }) || `Đã xóa Slot ${slot}` });
      await loadSlotInfo();
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.deleteFailed') || 'Xóa thất bại' });
    } finally {
      setSavingSlot(null);
    }
  }, [game, t, loadSlotInfo]);

  return {
    showSaveModal, setShowSaveModal,
    saveModalMode,
    saveSlots, savingSlot, saveStatus,
    openSaveModal,
    handleSaveToSlot, handleLoadFromSlot, handleDeleteSlot,
    locale,
  };
}
