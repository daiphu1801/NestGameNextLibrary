'use client';

import { useKeybindingConfig } from '@/features/settings/hooks/useKeybindingConfig';
import { emulatorService, KeybindingConfig, DEFAULT_KEYBINDINGS } from '@/services/emulatorService';
import { RotateCcw, Save, Loader2, Gamepad2, AlertTriangle, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

type PlayerKey = 'p1' | 'p2';

const formatKeyDisplay = (key: string): string => {
    if (!key) return '...';
    const map: Record<string, string> = {
        'up': '↑', 'down': '↓', 'left': '←', 'right': '→',
        'enter': '↵ Enter', 'space': '␣ Space',
        'rshift': 'R Shift', 'lshift': 'L Shift',
        'rctrl': 'R Ctrl', 'lctrl': 'L Ctrl',
        'ralt': 'R Alt', 'lalt': 'L Alt',
        'escape': 'Esc', 'tab': '⇥ Tab', 'backspace': '⌫',
        'capslock': 'Caps', 'del': 'Del',
        'keypad1': 'Num 1', 'keypad2': 'Num 2', 'keypad3': 'Num 3', 'keypad4': 'Num 4',
        'keypad5': 'Num 5', 'keypad6': 'Num 6', 'keypad7': 'Num 7', 'keypad8': 'Num 8',
        'keypad9': 'Num 9', 'keypad0': 'Num 0',
        'num1': 'Num 1', 'num2': 'Num 2', 'num3': 'Num 3', 'num4': 'Num 4',
        'num5': 'Num 5', 'num6': 'Num 6', 'num7': 'Num 7', 'num8': 'Num 8',
        'num9': 'Num 9', 'num0': 'Num 0',
    };
    return map[key] || key.toUpperCase();
};

const GAME_BUTTONS: { id: keyof KeybindingConfig['p1']; icon: string; color: string; systems?: string }[] = [
    { id: 'up', icon: '⬆', color: 'from-slate-600 to-slate-500' },
    { id: 'down', icon: '⬇', color: 'from-slate-600 to-slate-500' },
    { id: 'left', icon: '⬅', color: 'from-slate-600 to-slate-500' },
    { id: 'right', icon: '➡', color: 'from-slate-600 to-slate-500' },
    { id: 'a', icon: 'A', color: 'from-red-600 to-red-500' },
    { id: 'b', icon: 'B', color: 'from-red-700 to-red-600' },
    { id: 'x', icon: 'X', color: 'from-blue-600 to-blue-500', systems: 'SNES / Genesis' },
    { id: 'y', icon: 'Y', color: 'from-green-600 to-green-500', systems: 'SNES / Genesis' },
    { id: 'l', icon: 'L', color: 'from-slate-500 to-slate-400', systems: 'SNES / GBA / Genesis' },
    { id: 'r', icon: 'R', color: 'from-slate-500 to-slate-400', systems: 'SNES / GBA / Genesis' },
    { id: 'start', icon: '▶', color: 'from-gray-600 to-gray-500' },
    { id: 'select', icon: '◉', color: 'from-gray-600 to-gray-500' },
];

const PLAYER_COLORS: Record<PlayerKey, { bg: string; text: string; accent: string; border: string; glow: string }> = {
    p1: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        accent: 'from-blue-500 to-cyan-500',
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/20',
    },
    p2: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        accent: 'from-orange-500 to-amber-500',
        border: 'border-orange-500/30',
        glow: 'shadow-orange-500/20',
    },
};

export function KeybindingSelector() {
    const {
        config, activePlayer, setActivePlayer, listeningButton, setListeningButton,
        isSaving, saveSuccess, message, hasUnsavedChanges,
        activeConflicts, hasAnyConflicts, p1Conflicts, p2Conflicts,
        handleSave, handleReset, t
    } = useKeybindingConfig();
    
    const getButtonLabel = (id: string): string => {
        const labels: Record<string, string> = {
            up: t('settings.keyUp', undefined, 'Lên'), down: t('settings.keyDown', undefined, 'Xuống'),
            left: t('settings.keyLeft', undefined, 'Trái'), right: t('settings.keyRight', undefined, 'Phải'),
            a: t('settings.keyA', undefined, 'Nút A'), b: t('settings.keyB', undefined, 'Nút B'),
            x: t('settings.keyX', undefined, 'Button X'), y: t('settings.keyY', undefined, 'Button Y'), l: t('settings.keyL', undefined, 'Button L'), r: t('settings.keyR', undefined, 'Button R'),
            start: t('settings.keyStart', undefined, 'Start'), select: t('settings.keySelect', undefined, 'Select'),
        };
        return labels[id] || id;
    };
    
    const colors = PLAYER_COLORS[activePlayer];

    return (
        <div className="space-y-5">
            {/* Player Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {(['p1', 'p2'] as PlayerKey[]).map((player) => {
                    const isActive = activePlayer === player;
                    const pc = PLAYER_COLORS[player];
                    const hasConflict = player === 'p1' ? p1Conflicts.size > 0 : p2Conflicts.size > 0;
                    const label = player === 'p1'
                        ? t('settings.player1', undefined, 'Player 1')
                        : t('settings.player2', undefined, 'Player 2');

                    return (
                        <button
                            key={player}
                            type="button"
                            onClick={() => { setActivePlayer(player); setListeningButton(null); }}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold transition-all",
                                isActive
                                    ? `${pc.bg} ${pc.text} border ${pc.border} shadow-lg ${pc.glow}`
                                    : "bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Gamepad2 className="w-4 h-4 shrink-0" />
                            {label}
                            {hasConflict && (
                                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 absolute -top-1.5 -right-1.5" />
                            )}
                        </button>
                    );
                })}

                <div className="flex-1" />

                <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors border border-white/5"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('settings.resetDefault', undefined, 'Mặc định')}</span>
                    <span className="sm:hidden">Reset</span>
                </button>
            </div>

            {/* Instruction hint */}
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
                <span className="hidden sm:inline">{t('settings.controlsHint', undefined, 'Bấm vào ô phím → nhấn phím mới trên bàn phím → Lưu. Nhấn Esc để hủy.')}</span>
                <span className="sm:hidden">Bấm ô phím → Nhấn phím mới → Lưu</span>
            </p>

            {/* Conflict warning */}
            {activeConflicts.size > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{t('settings.controlsConflict', undefined, 'Có phím bị trùng! Mỗi nút phải gán một phím riêng.')}</span>
                </div>
            )}

            {/* Keybinding grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GAME_BUTTONS.map((btn) => {
                    const isListening = listeningButton === btn.id;
                    const isConflicted = activeConflicts.has(btn.id);

                    return (
                        <button
                            type="button"
                            key={btn.id}
                            className={cn(
                                "relative group cursor-pointer transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-white/20",
                                isListening ? "scale-[1.03]" : "hover:scale-[1.02]"
                            )}
                            onClick={(e) => { e.stopPropagation(); setListeningButton(btn.id); }}
                        >
                            <div className={cn(
                                "p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all min-h-[100px]",
                                isListening
                                    ? `${colors.bg} ${colors.border} shadow-[0_0_20px_rgba(100,100,255,0.15)]`
                                    : isConflicted
                                        ? "bg-yellow-500/10 border-yellow-500/30"
                                        : "bg-black/20 border-white/10 hover:border-white/20 hover:bg-white/5"
                            )}>
                                {/* NES button icon */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white bg-gradient-to-b shadow-md",
                                    btn.color
                                )}>
                                    {btn.icon}
                                </div>

                                {/* Button label */}
                                <div className="text-center">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
                                        {getButtonLabel(btn.id)}
                                    </span>
                                    {btn.systems && (
                                        <span className="text-[9px] font-medium text-purple-400/80 block mt-0.5">
                                            {btn.systems}
                                        </span>
                                    )}
                                </div>

                                {/* Assigned key */}
                                <div className={cn(
                                    "h-9 min-w-[2.5rem] px-3 flex items-center justify-center rounded-lg border text-sm font-bold font-mono transition-all",
                                    isListening
                                        ? `${colors.bg} ${colors.border} ${colors.text} animate-pulse`
                                        : isConflicted
                                            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                                            : "bg-black/40 border-white/10 text-white"
                                )}>
                                    {isListening ? (
                                        <span className="text-[10px] tracking-wider animate-pulse">
                                            {t('settings.pressKey', undefined, '⌨ Nhấn phím...')}
                                        </span>
                                    ) : (
                                        <span className="truncate max-w-[80px]">
                                            {formatKeyDisplay(config[activePlayer][btn.id])}
                                        </span>
                                    )}
                                </div>

                                {isConflicted && !isListening && (
                                    <AlertTriangle className="w-3 h-3 text-yellow-400 absolute top-2 right-2" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-white/10">
                <div className="text-sm font-medium min-h-[1.25rem] flex-1">
                    {message && (
                        <span className={cn(
                            "flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 text-xs sm:text-sm",
                            message.includes('trùng') || message.includes('Conflict') || message.includes('Không')
                                ? "text-red-400"
                                : saveSuccess ? "text-emerald-400" : "text-blue-400"
                        )}>
                            {saveSuccess && <Check className="w-4 h-4 shrink-0" />}
                            {message}
                        </span>
                    )}
                    {!message && hasUnsavedChanges && (
                        <span className="text-xs text-yellow-400/70 animate-in fade-in">
                            {t('settings.unsavedChanges', undefined, '● Có thay đổi chưa lưu')}
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || hasAnyConflicts}
                    className={cn(
                        "w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r",
                        colors.accent, colors.glow
                    )}
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('settings.saveControls', undefined, 'Lưu cấu hình')}
                </button>
            </div>
        </div>
    );
}
