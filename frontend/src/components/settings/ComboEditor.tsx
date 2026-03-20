'use client';

import { useComboEditor } from '@/features/settings/hooks/useComboEditor';
import { useCombo } from '@/hooks/useCombo';
import { PRESET_COMBOS, COMBO_SLOT_LABELS, COMBO_KEYBOARD_SHORTCUTS } from '@/data/comboPresets';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Play, GripVertical, ChevronDown, Save, Gamepad2, Pencil } from 'lucide-react';
import type { ComboDefinition, ComboStep, ComboSlots } from '@/types/combo';
import type { NESButton } from '@/services/emulatorService';
import { comboService } from '@/services/comboService';

// ============================================================
// COMBO EDITOR — Settings component for combo configuration
// ============================================================

const ALL_BUTTONS: NESButton[] = ['up', 'down', 'left', 'right', 'a', 'b', 'x', 'y', 'l', 'r'];

const BUTTON_LABELS: Record<string, string> = {
  up: '↑', down: '↓', left: '←', right: '→',
  a: 'A', b: 'B', x: 'X', y: 'Y', l: 'L', r: 'R',
};

export function ComboEditor() {
    const { t } = useLanguage();
    const {
        config, allCombos, activeTab, setActiveTab, editingCombo, setEditingCombo,
        testingSlot, handleSlotChange, handleTestCombo, startNewCombo,
        updateStep, toggleStepButton, addStep, removeStep, saveCombo, removeCustomCombo, reload
    } = useComboEditor();
    
    const customCombos = config.customCombos || [];

  const ICONS = ['⚔️', '🔥', '⚡', '🌀', '💨', '💥', '🌟', '🎯', '💪', '🦊'];

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { id: 'slots' as const, label: t('settings.combo.slots') || 'Gán Combo', Icon: Gamepad2 },
          { id: 'custom' as const, label: t('settings.combo.custom') || 'Tạo Combo', Icon: Pencil },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
              activeTab === tab.id
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <tab.Icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SLOT ASSIGNMENT TAB ── */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          {(['p1', 'p2'] as const).map(player => {
            const slots = player === 'p1' ? config.p1Slots : config.p2Slots;
            const shortcuts = COMBO_KEYBOARD_SHORTCUTS[player];
            const tagColor = player === 'p1' ? 'cyan' : 'pink';

            return (
              <div key={player} className={cn(
                'rounded-xl border p-4',
                player === 'p1'
                  ? 'bg-cyan-500/[0.03] border-cyan-500/[0.1]'
                  : 'bg-pink-500/[0.03] border-pink-500/[0.1]'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    'text-[10px] font-black px-1.5 py-0.5 rounded',
                    player === 'p1' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-pink-500/15 text-pink-400'
                  )}>
                    {player.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {player === 'p1' ? 'Player 1' : 'Player 2'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMBO_SLOT_LABELS.map((label, i) => {
                    const selectedId = slots[i];
                    const combo = allCombos.find(c => c.id === selectedId);

                    return (
                      <div key={label} className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/[0.05]">
                        {/* Slot label + shortcut */}
                        <div className="flex flex-col items-center gap-0.5 w-10 shrink-0">
                          <span className="text-[10px] font-black text-purple-400">{label}</span>
                          <kbd className={cn(
                            'text-[8px] font-mono px-1 py-0.5 rounded border',
                            player === 'p1'
                              ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                              : 'bg-pink-500/10 border-pink-500/20 text-pink-300'
                          )}>
                            {shortcuts[i].toUpperCase()}
                          </kbd>
                        </div>

                        {/* Combo selector */}
                        <div className="relative flex-1">
                          <select
                            value={selectedId}
                            onChange={(e) => handleSlotChange(player, i, e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-xs appearance-none cursor-pointer hover:bg-white/[0.08] transition-colors pr-6 outline-none focus:border-purple-500/40"
                          >
                            {allCombos.map(c => (
                              <option key={c.id} value={c.id} className="bg-[#1a1a2e] text-white">
                                {c.icon} {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                        </div>

                        {/* Test button */}
                        <button
                          onClick={() => handleTestCombo(i, player)}
                          disabled={testingSlot !== null}
                          className={cn(
                            'p-1.5 rounded-lg transition-all shrink-0',
                            testingSlot === i
                              ? 'bg-purple-500/30 text-purple-300 animate-pulse'
                              : 'bg-white/[0.05] text-slate-400 hover:bg-purple-500/20 hover:text-purple-300'
                          )}
                          title="Test combo"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Combo preview */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t('settings.combo.presetList') || 'Danh sách Combo có sẵn'}
            </p>
            <div className="space-y-1.5">
              {allCombos.map(combo => (
                <div key={combo.id} className="flex items-center gap-2 text-xs">
                  <span className="w-5 text-center">{combo.icon}</span>
                  <span className="text-slate-300 font-medium flex-1">{combo.name}</span>
                  <span className="text-slate-500 font-mono text-[10px]">{combo.motionDisplay}</span>
                  {!combo.isPreset && (
                    <button
                      onClick={() => { removeCustomCombo(combo.id); reload(); }}
                      className="p-1 rounded text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM COMBO TAB ── */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          {/* Custom combos list */}
          {customCombos.length > 0 && (
            <div className="space-y-2">
              {customCombos.map(combo => (
                <div key={combo.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-base">{combo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{combo.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{combo.motionDisplay}</p>
                  </div>
                  <button
                    onClick={() => setEditingCombo({ ...combo })}
                    className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { removeCustomCombo(combo.id); reload(); }}
                    className="p-1.5 rounded text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New combo button or editor */}
          {!editingCombo ? (
            <button
              onClick={startNewCombo}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/10 text-slate-400 hover:border-purple-500/30 hover:text-purple-400 hover:bg-purple-500/[0.03] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('settings.combo.createNew') || 'Tạo combo mới'}</span>
            </button>
          ) : (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.03] p-4 space-y-4">
              {/* Combo meta */}
              <div className="flex items-center gap-3">
                {/* Icon picker */}
                <div className="relative group">
                  <button className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-lg hover:bg-white/[0.08] transition-colors">
                    {editingCombo.icon}
                  </button>
                  <div className="absolute top-full mt-1 left-0 z-10 hidden group-hover:grid grid-cols-5 gap-1 p-2 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-xl">
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setEditingCombo({ ...editingCombo, icon })}
                        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <input
                  type="text"
                  value={editingCombo.name}
                  onChange={(e) => setEditingCombo({ ...editingCombo, name: e.target.value })}
                  placeholder="Combo name"
                  className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm outline-none focus:border-purple-500/40 placeholder:text-slate-600"
                />
              </div>

              {/* Steps */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Steps ({editingCombo.steps.length})
                </p>
                <div className="space-y-2">
                  {editingCombo.steps.map((step, si) => (
                    <div key={si} className="flex items-start gap-2 p-2.5 rounded-lg bg-black/20 border border-white/[0.05]">
                      <div className="flex flex-col items-center gap-1 w-4 shrink-0 pt-0.5">
                        <GripVertical className="w-3 h-3 text-slate-600" />
                        <span className="text-[8px] font-mono text-slate-600">{si + 1}</span>
                      </div>

                      {/* Buttons grid */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap gap-1">
                          {ALL_BUTTONS.map(btn => {
                            const active = step.buttons.includes(btn);
                            return (
                              <button
                                key={btn}
                                onClick={() => toggleStepButton(si, btn)}
                                className={cn(
                                  'px-2 py-1 rounded text-[10px] font-bold transition-all border',
                                  active
                                    ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
                                    : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-white hover:bg-white/[0.06]'
                                )}
                              >
                                {BUTTON_LABELS[btn]}
                              </button>
                            );
                          })}
                        </div>

                        {/* Duration slider */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-600 w-8 shrink-0">ms:</span>
                          <input
                            type="range"
                            min="0" max="1000" step="10"
                            value={step.duration}
                            onChange={(e) => updateStep(si, 'duration', Number(e.target.value))}
                            className="flex-1 h-1 accent-purple-500"
                          />
                          <span className="text-[10px] font-mono text-slate-400 w-10 text-right">{step.duration}</span>
                        </div>
                      </div>

                      {/* Remove step */}
                      <button
                        onClick={() => removeStep(si)}
                        disabled={editingCombo.steps.length <= 1}
                        className="p-1 rounded text-rose-400/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addStep}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-white/10 text-slate-500 hover:text-white hover:border-purple-500/30 transition-colors text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Thêm step
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.05]">
                <button
                  onClick={() => setEditingCombo(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {t('settings.combo.cancel') || 'Hủy'}
                </button>
                <button
                  onClick={saveCombo}
                  disabled={!editingCombo.name.trim() || editingCombo.steps.every(s => s.buttons.length === 0)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <Save className="w-3.5 h-3.5" />
                  {t('settings.combo.save') || 'Lưu Combo'}
                </button>
              </div>
            </div>
          )}

          {customCombos.length === 0 && !editingCombo && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500">{t('settings.combo.noCustom') || 'Chưa có combo tùy chỉnh nào.'}</p>
              <p className="text-xs text-slate-600 mt-1">{t('settings.combo.noCustomDesc') || 'Nhấn nút bên trên để tạo combo riêng.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
