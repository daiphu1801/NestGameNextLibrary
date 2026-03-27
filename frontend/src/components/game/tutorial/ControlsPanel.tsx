'use client';

import { ChevronRight, ChevronLeft, Keyboard, Save, Zap } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';

// ================================================================
// LEFT PANEL — Controls Guide
// ================================================================

interface ControlsPanelProps {
  system?: string;
  isZapper?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ControlsPanel({
  system = 'nes',
  isZapper = false,
  isCollapsed = false,
  onToggleCollapse,
}: ControlsPanelProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "relative h-full bg-gradient-to-b from-[#12122a] to-[#0d0d1f] transition-all duration-300 flex flex-col",
        "border-r border-white/[0.06]",
        isCollapsed ? "w-10" : "w-[260px] min-w-[220px]",
      )}
    >
      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-[#1a1a35] hover:bg-purple-500/20 border border-white/[0.08] rounded-r-lg items-center justify-center text-slate-400 hover:text-purple-300 transition-all"
          title={isCollapsed ? t('play.expandTutorial') : t('play.collapseTutorial')}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-purple-500/15 flex items-center justify-center text-slate-400 hover:text-purple-300 transition-all"
            title={t('docs.controls.title')}
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-purple-400" />
              <h3 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                {t('docs.controls.title')}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            <ControlsGuideCompact system={system} isZapper={isZapper} />
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Controls Guide — Balanced compact layout
// ============================================
export function ControlsGuideCompact({ system = 'nes', isZapper = false }: { system?: string, isZapper?: boolean }) {
  const { t } = useLanguage();
  const isAdvancedSystem = ['snes', 'gba', 'genesis', 'arcade', 'ps1', 'psx', 'psp'].includes(system.toLowerCase());

  if (system === 'j2me') {
    return (
      <div className="space-y-4">
        <BalancedPlayerCard
          tag="Nokia" label="D-Pad" tagColor="cyan"
          moveKeys={['↑', '←', '↓', '→']}
          actions={[
            ['Enter', t('javaPortal.controls.action')],
            ['Q', t('javaPortal.controls.softLeft')],
            ['W', t('javaPortal.controls.softRight')]
          ]}
        />
        <div className="rounded-xl border p-3 bg-teal-500/[0.05] border-teal-500/[0.1]">
          <div className="flex items-center gap-2 mb-3">
             <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400">NUM</span>
             <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{t('javaPortal.controls.numpad')}</span>
          </div>
          
          <div className="flex items-start gap-4">
             <div className="grid grid-cols-3 gap-1 flex-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <kbd key={k} className="flex items-center justify-center h-6 rounded border bg-teal-500/10 border-teal-500/25 text-teal-300 text-[10px] font-mono font-bold">
                    {k}
                  </kbd>
                ))}
            </div>
            <div className="flex flex-col gap-2 justify-center py-1 flex-1">
               <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 pl-1">{t('javaPortal.controls.mapping')}</div>
               <KeyRow keyName="0-9" label="Numpad" color="emerald" />
               <KeyRow keyName="E" label={t('javaPortal.controls.star')} color="emerald" />
               <KeyRow keyName="R" label={t('javaPortal.controls.hash')} color="emerald" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase">{t('javaPortal.controls.system')}</span>
          </div>
          <div className="flex flex-col gap-1.5">
             <KeyRow keyName="Esc" label={t('javaPortal.controls.menu')} color="emerald" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* P1 & P2 — stacked, each with horizontal action rows */}
      <BalancedPlayerCard
        tag="P1" label={t('docs.controls.player1')} tagColor="cyan"
        moveKeys={['W', 'A', 'S', 'D']}
        actions={isAdvancedSystem
          ? [['K', 'A'], ['J', 'B'], ['O', 'L'], ['L', 'R'], ['I', 'X'], ['U', 'Y']]
          : [['K', 'A'], ['J', 'B']]
        }
      />
      
      <BalancedPlayerCard
        tag="P2" label={t('docs.controls.player2')} tagColor="pink"
        moveKeys={['↑', '←', '↓', '→']}
        actions={isAdvancedSystem
          ? [['NP2', 'A'], ['NP1', 'B'], ['NP6', 'L'], ['NP3', 'R'], ['NP5', 'X'], ['NP4', 'Y']]
          : [['NP2', 'A'], ['NP1', 'B']]
        }
      />
      
      {isZapper && (
        <div className="rounded-xl border bg-pink-500/[0.05] border-pink-500/[0.1] p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-400">P2 (Zapper)</span>
            <span className="text-[10px] font-bold text-pink-400">Light Gun</span>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <KeyRow keyName="Click Trái" label="Bắn đạn" color="emerald" />
            <KeyRow keyName="Click Phải" label="Bắn trượt" color="emerald" />
            <div className="text-[9px] text-slate-500 mt-2 mb-1 border-t border-white/5 pt-2 uppercase tracking-wider">Bàn phím:</div>
            <KeyRow keyName="N" label="Bắn đạn" color="white" />
            <KeyRow keyName="M" label="Bắn trượt" color="white" />
          </div>
        </div>
      )}

      {/* Common */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
        <div className="flex items-center gap-2 mb-2">
          <Save className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase">{t('docs.controls.common')}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5" data-tutorial="startselect">
          <KeyRow keyName="Enter" label="Start P1" color="emerald" />
          <KeyRow keyName="NP7" label="Start P2" color="emerald" />
          <KeyRow keyName="Shift" label="Select P1" color="emerald" />
          <KeyRow keyName="NP8" label="Select P2" color="emerald" />
          <KeyRow keyName="F5" label={t('saveState.quickSave')} color="emerald" />
          <KeyRow keyName="F8" label={t('saveState.quickLoad')} color="emerald" />
        </div>
      </div>

      {/* Combo (SNES/GBA only) */}
      {isAdvancedSystem && (
        <div className="rounded-xl bg-gradient-to-br from-purple-500/[0.06] to-fuchsia-500/[0.04] border border-purple-500/[0.12] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Combo</span>
            <span className="ml-auto text-[8px] text-slate-600 italic">⚙ Tùy chỉnh trong Cài đặt</span>
          </div>
          <div className="space-y-2">
            {[
              { icon: '🔥', name: 'Chưởng (Hadouken)', desc: 'Cầu lửa cơ bản', motion: '↓↘→ + Y', p1: 'T', p2: 'NP0' },
              { icon: '⚡', name: 'Đấm móc (Shoryuken)', desc: 'Phòng không cận chiến', motion: '→↓↘ + Y', p1: 'Y', p2: 'NP9' },
              { icon: '🌀', name: 'Đá xoay (Tatsumaki)', desc: 'Tiếp cận từ xa', motion: '↓↙← + B', p1: 'G', p2: 'NP+' },
              { icon: '💨', name: 'Siêu chiêu (Lv1)', desc: 'Tốn 1 thanh nộ', motion: '↓↘→↓↘→ + Y', p1: 'H', p2: 'NP-' },
              { icon: '💥', name: 'Siêu chiêu (Super QCF)', desc: 'Cần 3 thanh nộ Max', motion: '↓↘→↓↘→ + 3P', p1: 'B', p2: 'NP*' },
              { icon: '🌪️', name: 'Siêu lốc (Super QCB)', desc: 'Cần 3 thanh nộ Max', motion: '↓↙←↓↙← + 3K', p1: 'N', p2: 'NP/' },
            ].map((c) => (
              <div key={c.name} className="flex flex-col gap-0.5 border-b border-white/[0.02] pb-1.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-4 text-center shrink-0">{c.icon}</span>
                  <span className="font-semibold text-slate-300 truncate flex-1">{c.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <kbd className="px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[8.5px] font-semibold min-w-[16px] text-center shrink-0 max-w-[40px] truncate">{c.p1}</kbd>
                    <kbd className="px-1 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-300 font-mono text-[8.5px] font-semibold min-w-[20px] text-center shrink-0 max-w-[40px] truncate">{c.p2}</kbd>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-[8.5px] text-slate-500 italic flex-1 truncate">{c.desc}</span>
                  <span className="text-slate-400 font-mono text-[8px] tracking-tighter shrink-0">{c.motion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Balanced player card — movement horizontal, actions in 3-col grid
export function BalancedPlayerCard({ tag, label, tagColor, moveKeys, actions }: {
  tag: string;
  label: string;
  tagColor: 'cyan' | 'pink';
  moveKeys: string[];
  actions: [string, string][];
}) {
  const colors = {
    cyan: { bg: 'bg-cyan-500/[0.05]', border: 'border-cyan-500/[0.1]', tag: 'bg-cyan-500/15 text-cyan-400', kbd: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300' },
    pink: { bg: 'bg-pink-500/[0.05]', border: 'border-pink-500/[0.1]', tag: 'bg-pink-500/15 text-pink-400', kbd: 'bg-pink-500/10 border-pink-500/25 text-pink-300' },
  };
  const c = colors[tagColor];

  return (
    <div className={cn('rounded-xl border p-3', c.bg, c.border)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded', c.tag)}>{tag}</span>
        <span className={cn('text-[10px] font-bold', c.tag.split(' ')[1])}>{label}</span>
      </div>

      <div className="flex items-start gap-3">
        {/* Movement */}
        <div>
          <div className="text-[8px] text-slate-600 uppercase tracking-wider mb-1">{tag === 'P1' ? 'WASD' : 'Arrow'}</div>
          <div className="grid grid-cols-3 gap-0.5 w-fit">
            <div />
            <kbd className={cn('flex items-center justify-center w-6 h-5 rounded border text-[10px] font-mono font-semibold', c.kbd)}>{moveKeys[0]}</kbd>
            <div />
            {moveKeys.slice(1).map(k => (
              <kbd key={k} className={cn('flex items-center justify-center w-6 h-5 rounded border text-[10px] font-mono font-semibold', c.kbd)}>{k}</kbd>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-white/[0.06] self-center" />

        {/* Actions */}
        <div className="flex-1">
          <div className="text-[8px] text-slate-600 uppercase tracking-wider mb-1">Buttons</div>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1">
            {actions.map(([key, lbl]) => (
              <div key={key} className="flex items-center gap-1">
                <kbd className={cn('inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded border text-[10px] font-mono font-semibold', c.kbd)}>{key}</kbd>
                <span className="text-slate-400 text-[10px]">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable player controls card
export function PlayerControlsCard({
  label,
  tag,
  tagColor,
  movement,
  actions,
  movementLabel,
  actionsLabel,
  movementDataTutorial,
  actionsDataTutorial,
}: {
  label: string;
  tag: string;
  tagColor: 'cyan' | 'pink';
  movement: string[];
  actions: { key: string; label: string; group?: string }[];
  movementLabel?: string;
  actionsLabel?: string;
  movementDataTutorial?: string;
  actionsDataTutorial?: string;
}) {
  const colors = {
    cyan: {
      bg: 'bg-cyan-500/[0.06]',
      border: 'border-cyan-500/[0.12]',
      tag: 'bg-cyan-500/15 text-cyan-400',
      label: 'text-cyan-400',
      kbd: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300',
    },
    pink: {
      bg: 'bg-pink-500/[0.06]',
      border: 'border-pink-500/[0.12]',
      tag: 'bg-pink-500/15 text-pink-400',
      label: 'text-pink-400',
      kbd: 'bg-pink-500/10 border-pink-500/25 text-pink-300',
    },
  };

  const c = colors[tagColor];

  return (
    <div className={cn('rounded-xl border p-2.5', c.bg, c.border)}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black', c.tag)}>
          {tag}
        </div>
        <span className={cn('text-[10px] font-bold', c.label)}>{label}</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {/* Movement */}
        <div className="col-span-2" {...(movementDataTutorial ? { 'data-tutorial': movementDataTutorial } : {})}>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">{movementLabel || 'Movement'}:</div>
          <div className="flex flex-wrap gap-0.5">
            {movement.map((key) => (
              <kbd
                key={key}
                className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded border text-[10px] font-mono font-semibold',
                  c.kbd
                )}
              >
                {key}
              </kbd>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-3" {...(actionsDataTutorial ? { 'data-tutorial': actionsDataTutorial } : {})}>
          <div className="space-y-2">
            {actions.map((a, i) => {
              const showGroup = a.group && (i === 0 || a.group !== actions[i - 1].group);
              return (
                <div key={a.key} className="flex flex-col gap-1">
                  {showGroup && (
                    <div className="text-[8.5px] font-bold text-slate-500/80 uppercase tracking-widest mt-1 mb-0.5">
                      {a.group}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <kbd className={cn(
                      'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded border font-mono font-semibold',
                      c.kbd
                    )}>
                      {a.key}
                    </kbd>
                    <span className="text-slate-400 font-medium">{a.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Single key-label row
export function KeyRow({ keyName, label, color }: { keyName: string; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
  };

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <kbd className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-4 px-1 rounded border font-mono font-semibold text-[9px]',
        colorMap[color] || 'bg-white/5 border-white/10 text-white'
      )}>
        {keyName}
      </kbd>
      <span className="text-slate-400 truncate">{label}</span>
    </div>
  );
}
