import { useLanguage } from '@/components/providers/LanguageProvider';

interface ControlSidebarProps {
  player: 1 | 2;
  isZapper?: boolean;
}

export function ControlSidebar({ player, isZapper }: ControlSidebarProps) {
  const { t } = useLanguage();

  if (player === 1) {
    return (
      <div className="hidden lg:flex flex-col w-[140px] bg-[#0d0d0d] border-r border-white/10 p-3">
        <div className="text-xs font-bold text-blue-400 mb-3 text-center">
          Player 1
        </div>
        <div className="flex flex-col gap-2">
          <div data-tutorial="movement">
            <ControlHintVertical keys="W A S D" label={t('docs.controls.movement') || 'Di chuyển'} />
          </div>
          <div data-tutorial="actions">
            <ControlHintVertical keys="J" label={t('modal.buttonA') || 'Nút A'} color="text-cyan-400" />
            <ControlHintVertical keys="K" label={t('modal.buttonB') || 'Nút B'} color="text-cyan-400" />
          </div>
          <div data-tutorial="startselect">
            <ControlHintVertical keys="Enter" label="Start" color="text-green-400" />
            <ControlHintVertical keys="Shift" label="Select" color="text-yellow-400" />
          </div>
          <div className="mt-4 px-1">
            <p className="text-[10px] text-muted-foreground text-center italic leading-tight opacity-70">
              {t('modal.controlsNote') || '*Vai trò (Nhảy/Đánh/...) của A/B tùy thuộc vào từng game'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Player 2
  return (
    <div className="hidden lg:flex flex-col w-[140px] bg-[#0d0d0d] border-l border-white/10 p-3">
      <div className="text-xs font-bold text-red-400 mb-3 text-center">
        Player 2
      </div>
      <div className="flex flex-col gap-1.5 self-center">
        <ControlHintVertical keys="↑ ↓ ← →" label={t('docs.controls.movement') || 'Di chuyển'} />
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
          <ControlHintVertical keys="NP1" label="B" color="text-cyan-400" />
          <ControlHintVertical keys="NP2" label="A" color="text-cyan-400" />
          <ControlHintVertical keys="NP4" label="Y" color="text-cyan-400" />
          <ControlHintVertical keys="NP5" label="X" color="text-cyan-400" />
          <ControlHintVertical keys="NP6" label="L" color="text-cyan-400" />
          <ControlHintVertical keys="NP3" label="R" color="text-cyan-400" />
        </div>
        <div className="flex justify-center gap-2 mt-2 border-t border-white/5 pt-2">
          <ControlHintVertical keys="NP7" label="S" color="text-green-400" />
          <ControlHintVertical keys="NP8" label="Sl" color="text-yellow-400" />
        </div>
        <div className="mt-4 px-1">
          <p className="text-[10px] text-muted-foreground text-center italic leading-tight opacity-70">
            {t('modal.controlsNote') || '*Vai trò (Nhảy/Đánh/...) của A/B tùy thuộc vào từng game'}
          </p>
        </div>

        {isZapper && (
          <div className="mt-4 pt-4 border-t border-white/10 w-full flex flex-col gap-2">
            <div className="text-[10px] text-pink-400 font-bold text-center mb-1 uppercase tracking-wider">Zapper (Súng)</div>
            <ControlHintVertical keys="L Click" label="Bắn" color="text-rose-400" />
            <ControlHintVertical keys="R Click" label="Bắn trượt" color="text-rose-400" />
            <div className="text-[10px] text-muted-foreground text-center mt-2 mb-1">Dự phòng:</div>
            <div className="grid grid-cols-2 gap-x-2">
              <ControlHintVertical keys="N" label="Bắn" color="text-yellow-400" />
              <ControlHintVertical keys="M" label="Trượt" color="text-yellow-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ControlHintVertical({ keys, label, color = 'text-white' }: { keys: string; label: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <kbd className={`px-2 py-1 rounded bg-white/10 font-mono text-xs ${color}`}>
        {keys}
      </kbd>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
