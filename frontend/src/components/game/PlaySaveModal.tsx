'use client';

import { SaveSlotInfo } from '@/services/saveStateService';
import { Save, FolderOpen, X, Trash2, Loader2 } from 'lucide-react';

interface PlaySaveModalProps {
  mode: 'save' | 'load';
  saveSlots: (SaveSlotInfo | null)[];
  savingSlot: number | null;
  saveStatus: { type: 'success' | 'error'; message: string } | null;
  locale: string;
  t: (key: string, ...args: any[]) => string;
  onClose: () => void;
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
  onDelete: (slot: number) => void;
}

export function PlaySaveModal({
  mode, saveSlots, savingSlot, saveStatus, locale, t,
  onClose, onSave, onLoad, onDelete
}: PlaySaveModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-[#0d0d1f] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {mode === 'save' ? (
              <><Save className="w-5 h-5 text-emerald-400" /> {t('saveState.saveGame')}</>
            ) : (
              <><FolderOpen className="w-5 h-5 text-blue-400" /> {t('saveState.loadGame')}</>
            )}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saveStatus && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${saveStatus.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
            {saveStatus.message}
          </div>
        )}

        <div className="space-y-3">
          {[1, 2, 3].map((slot) => {
            const info = saveSlots[slot - 1];
            const isProcessing = savingSlot === slot;

            return (
              <div
                key={slot}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{t('saveState.slot')} {slot}</div>
                  {info ? (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(info.updatedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground/50 mt-0.5">{t('saveState.empty')}</div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {mode === 'save' ? (
                    <button
                      onClick={() => onSave(slot)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : info ? (t('saveState.overwrite')) : (t('saveState.save'))}
                    </button>
                  ) : (
                    <button
                      onClick={() => onLoad(slot)}
                      disabled={!info || isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (t('saveState.load'))}
                    </button>
                  )}

                  {info && (
                    <button
                      onClick={() => onDelete(slot)}
                      disabled={isProcessing}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all disabled:opacity-50"
                      title={t('saveState.delete')}
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
