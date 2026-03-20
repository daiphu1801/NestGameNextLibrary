import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Save, FolderOpen, Trash2 } from 'lucide-react';
import { saveStateService, SaveSlotInfo } from '@/services/saveStateService';
import { emulatorService } from '@/services/emulatorService';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface SaveStateModalProps {
  isOpen: boolean;
  mode: 'save' | 'load';
  gameId: string;
  onClose: () => void;
}

export function SaveStateModal({ isOpen, mode, gameId, onClose }: SaveStateModalProps) {
  const { t, locale } = useLanguage();
  const [saveSlots, setSaveSlots] = useState<(SaveSlotInfo | null)[]>([null, null, null]);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadSlotInfo = useCallback(async () => {
    try {
      const slots = await saveStateService.listSlots(gameId);
      const slotArray: (SaveSlotInfo | null)[] = [null, null, null];
      slots.forEach(s => {
        if (s.slot >= 1 && s.slot <= 3) slotArray[s.slot - 1] = s;
      });
      setSaveSlots(slotArray);
    } catch (err) {
      console.error('Failed to load save slots:', err);
    }
  }, [gameId]);

  useEffect(() => {
    if (isOpen) {
      setSaveStatus(null);
      loadSlotInfo();
    }
  }, [isOpen, loadSlotInfo]);

  const handleSaveToSlot = async (slot: number) => {
    setSavingSlot(slot);
    setSaveStatus(null);
    try {
      const result = await emulatorService.saveState();
      if (!result) throw new Error(t('saveState.emulatorNotReady') || 'Emulator chưa sẵn sàng');

      await saveStateService.saveToServer(gameId, slot, result.state, result.thumbnail);
      setSaveStatus({ type: 'success', message: t('saveState.saved', { slot }) || `Đã lưu vào Slot ${slot}!` });
      await loadSlotInfo();
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.saveFailed') || 'Lưu thất bại' });
    } finally {
      setSavingSlot(null);
    }
  };

  const handleLoadFromSlot = async (slot: number) => {
    setSavingSlot(slot);
    setSaveStatus(null);
    try {
      const stateBlob = await saveStateService.loadFromServer(gameId, slot);
      await emulatorService.loadState(stateBlob);
      setSaveStatus({ type: 'success', message: t('saveState.loaded', { slot }) || `Đã tải Slot ${slot}!` });
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.loadFailed') || 'Tải thất bại' });
    } finally {
      setSavingSlot(null);
    }
  };

  const handleDeleteSlot = async (slot: number) => {
    setSavingSlot(slot);
    try {
      await saveStateService.deleteSlot(gameId, slot);
      setSaveStatus({ type: 'success', message: t('saveState.deleted', { slot }) || `Đã xóa Slot ${slot}` });
      await loadSlotInfo();
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || t('saveState.deleteFailed') || 'Xóa thất bại' });
    } finally {
      setSavingSlot(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {mode === 'save' ? (
              <><Save className="w-5 h-5 text-emerald-400" /> {t('saveState.saveGame') || 'Lưu Game'}</>
            ) : (
              <><FolderOpen className="w-5 h-5 text-blue-400" /> {t('saveState.loadGame') || 'Tải Game'}</>
            )}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Message */}
        {saveStatus && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${saveStatus.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
            {saveStatus.message}
          </div>
        )}

        {/* Slot List */}
        <div className="space-y-3">
          {[1, 2, 3].map((slot) => {
            const info = saveSlots[slot - 1];
            const isProcessing = savingSlot === slot;

            return (
              <div
                key={slot}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                {/* Slot Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{t('saveState.slot') || 'Slot'} {slot}</div>
                  {info ? (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(info.updatedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')} · {Math.round(info.stateSize / 1024)}KB
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground/50 mt-0.5">{t('saveState.empty') || 'Trống'}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  {mode === 'save' ? (
                    <button
                      onClick={() => handleSaveToSlot(slot)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : info ? (t('saveState.overwrite') || 'Ghi đè') : (t('saveState.save') || 'Lưu')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLoadFromSlot(slot)}
                      disabled={!info || isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (t('saveState.load') || 'Tải')}
                    </button>
                  )}

                  {/* Delete Button */}
                  {info && (
                    <button
                      onClick={() => handleDeleteSlot(slot)}
                      disabled={isProcessing}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all disabled:opacity-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
