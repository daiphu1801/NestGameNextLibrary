'use client';

import { Keyboard } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { BalancedPlayerCard, KeyRow } from './tutorial/ControlsPanel';

export function J2meControlsPane() {
  const { t } = useLanguage();

  return (
    <div className="w-full h-full flex flex-col hidden xl:flex lg:w-[260px] min-w-[220px] bg-[#0a0a0a] border-l border-white/[0.06]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
            {t('javaPortal.controls.title')}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        
        {/* Navigation & Select */}
        <BalancedPlayerCard
          tag="Nokia" label="D-Pad" tagColor="cyan"
          moveKeys={['↑', '←', '↓', '→']}
          actions={[
            ['Enter', t('javaPortal.controls.action')],
            ['Q', t('javaPortal.controls.softLeft')],
            ['W', t('javaPortal.controls.softRight')]
          ]}
        />

        {/* Numpad */}
        <div className="rounded-xl border p-3 bg-teal-500/[0.05] border-teal-500/[0.1]">
          <div className="flex items-center gap-2 mb-3">
             <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400">NUM</span>
             <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{t('javaPortal.controls.numpad')}</span>
          </div>
          
          <div className="flex items-start gap-4">
             {/* 123 456 789 0 */}
             <div className="grid grid-cols-3 gap-1 flex-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <kbd key={k} className="flex items-center justify-center h-6 rounded border bg-teal-500/10 border-teal-500/25 text-teal-300 text-[10px] font-mono font-bold">
                    {k}
                  </kbd>
                ))}
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-2 justify-center py-1 flex-1">
               <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 pl-1">{t('javaPortal.controls.mapping')}</div>
               <KeyRow keyName="0-9" label="Numpad" color="emerald" />
               <KeyRow keyName="E" label={t('javaPortal.controls.star')} color="emerald" />
               <KeyRow keyName="R" label={t('javaPortal.controls.hash')} color="emerald" />
            </div>
          </div>
        </div>

        {/* System */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase">{t('javaPortal.controls.system')}</span>
          </div>
          <div className="flex flex-col gap-1.5">
             <KeyRow keyName="Esc" label={t('javaPortal.controls.menu')} color="emerald" />
          </div>
        </div>
        
      </div>
    </div>
  );
}
