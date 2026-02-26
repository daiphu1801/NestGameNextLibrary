'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    emulatorService,
    GamepadConfig,
    GamepadButtonMap,
    DEFAULT_GAMEPAD_MAPPING,
} from '@/services/emulatorService';
import {
    RotateCcw, Save, Loader2, Gamepad2, Check, ChevronDown, ChevronUp,
    Wifi, WifiOff, AlertCircle, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

type PlayerKey = 'p1' | 'p2';
type NesButton = keyof Omit<GamepadButtonMap, 'useAxis'>;

const NES_BUTTONS: { id: NesButton; icon: string; color: string }[] = [
    { id: 'up', icon: '⬆', color: 'from-slate-600 to-slate-500' },
    { id: 'down', icon: '⬇', color: 'from-slate-600 to-slate-500' },
    { id: 'left', icon: '⬅', color: 'from-slate-600 to-slate-500' },
    { id: 'right', icon: '➡', color: 'from-slate-600 to-slate-500' },
    { id: 'a', icon: 'A', color: 'from-red-600 to-red-500' },
    { id: 'b', icon: 'B', color: 'from-red-700 to-red-600' },
    { id: 'start', icon: '▶', color: 'from-gray-600 to-gray-500' },
    { id: 'select', icon: '◉', color: 'from-gray-600 to-gray-500' },
];

const PLAYER_COLORS = {
    p1: { bg: 'bg-blue-500/10', text: 'text-blue-400', accent: 'from-blue-500 to-cyan-500', border: 'border-blue-500/30' },
    p2: { bg: 'bg-orange-500/10', text: 'text-orange-400', accent: 'from-orange-500 to-amber-500', border: 'border-orange-500/30' },
};

/** Friendly label for a button index */
const formatBtnIndex = (idx: number, t: (k: string, ...args: any[]) => string): string => {
    const NAMED: Record<number, string> = {
        0: 'A / Cross(✕)', 1: 'B / Circle(○)',
        2: 'X / Square(□)', 3: 'Y / Triangle(△)',
        4: 'LB / L1', 5: 'RB / R1',
        6: 'LT / L2', 7: 'RT / R2',
        8: 'Back / Select', 9: 'Start / Options',
        10: 'L3', 11: 'R3',
        12: 'D-Pad ⬆', 13: 'D-Pad ⬇',
        14: 'D-Pad ⬅', 15: 'D-Pad ➡',
    };
    return NAMED[idx] ?? `${t('settings.gamepad.buttonIndex', undefined, 'Nút #')}${idx}`;
};

export function GamepadSelector() {
    const { t } = useLanguage();
    const [config, setConfig] = useState<GamepadConfig>(DEFAULT_GAMEPAD_MAPPING);
    const [activePlayer, setActivePlayer] = useState<PlayerKey>('p1');
    const [listening, setListening] = useState<NesButton | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [connectedPad, setConnectedPad] = useState<string | null>(null);
    const pollRef = useRef<number | null>(null);

    // Load saved config
    useEffect(() => {
        setConfig(emulatorService.getGamepadMapping());
    }, []);

    // Listen for gamepad connect/disconnect
    useEffect(() => {
        const onConnect = (e: GamepadEvent) => setConnectedPad(e.gamepad.id);
        const onDisconnect = () => {
            const pad = emulatorService.detectGamepad();
            setConnectedPad(pad ? pad.id : null);
        };
        window.addEventListener('gamepadconnected', onConnect);
        window.addEventListener('gamepaddisconnected', onDisconnect);

        // Check existing gamepads on mount
        const existing = emulatorService.detectGamepad();
        if (existing) setConnectedPad(existing.id);

        return () => {
            window.removeEventListener('gamepadconnected', onConnect);
            window.removeEventListener('gamepaddisconnected', onDisconnect);
        };
    }, []);

    // Poll for button press while listening
    useEffect(() => {
        if (!listening) {
            if (pollRef.current) cancelAnimationFrame(pollRef.current);
            return;
        }

        const poll = () => {
            const pads = navigator.getGamepads();
            for (const pad of pads) {
                if (!pad) continue;
                for (let i = 0; i < pad.buttons.length; i++) {
                    if (pad.buttons[i].pressed) {
                        setConfig(prev => ({
                            ...prev,
                            [activePlayer]: { ...prev[activePlayer], [listening]: i },
                        }));
                        setHasChanges(true);
                        setListening(null);
                        return;
                    }
                }
            }
            pollRef.current = requestAnimationFrame(poll);
        };

        // Small delay to avoid self-triggering
        const t = setTimeout(() => { pollRef.current = requestAnimationFrame(poll); }, 300);
        return () => {
            clearTimeout(t);
            if (pollRef.current) cancelAnimationFrame(pollRef.current);
        };
    }, [listening, activePlayer]);

    // Cancel listen on ESC
    useEffect(() => {
        if (!listening) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setListening(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [listening]);

    const getButtonLabel = (id: string) => {
        const m: Record<string, string> = {
            up: t('settings.keyUp', undefined, 'Lên'),
            down: t('settings.keyDown', undefined, 'Xuống'),
            left: t('settings.keyLeft', undefined, 'Trái'),
            right: t('settings.keyRight', undefined, 'Phải'),
            a: t('settings.keyA', undefined, 'Nút A'),
            b: t('settings.keyB', undefined, 'Nút B'),
            start: t('settings.keyStart', undefined, 'Start'),
            select: t('settings.keySelect', undefined, 'Select'),
        };
        return m[id] || id;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await emulatorService.saveGamepadMapping(config);
            setHasChanges(false);
            setSaveSuccess(true);
            setMessage(t('settings.gamepad.saved', undefined, 'Đã lưu cấu hình tay cầm!'));
            setTimeout(() => { setMessage(''); setSaveSuccess(false); }, 3000);
        } catch {
            setMessage(t('settings.controlsSaveError', undefined, 'Không thể lưu cấu hình'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setConfig(prev => ({ ...prev, [activePlayer]: DEFAULT_GAMEPAD_MAPPING[activePlayer] }));
        setHasChanges(true);
        const label = activePlayer === 'p1'
            ? t('settings.player1', undefined, 'Player 1')
            : t('settings.player2', undefined, 'Player 2');
        setMessage(`${label}: ${t('settings.controlsReset', undefined, 'Đã khôi phục mặc định. Bấm Lưu để áp dụng.')}`);
    };

    const colors = PLAYER_COLORS[activePlayer];

    return (
        <div className="space-y-5">
            {/* Gamepad Status */}
            <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                connectedPad
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-muted-foreground'
            )}>
                {connectedPad ? <Wifi className="w-4 h-4 shrink-0" /> : <WifiOff className="w-4 h-4 shrink-0" />}
                <span className="truncate">
                    {connectedPad
                        ? `${t('settings.gamepad.connected', undefined, 'Đã kết nối')}: ${connectedPad.length > 50 ? connectedPad.slice(0, 50) + '…' : connectedPad}`
                        : t('settings.gamepad.noGamepad', undefined, 'Chưa kết nối tay cầm – Cắm vào và nhấn bất kỳ nút nào')
                    }
                </span>
            </div>

            {/* Guide Toggle */}
            <button
                type="button"
                onClick={() => setShowGuide(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/15 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {t('settings.gamepad.guideTitle', undefined, 'Hướng dẫn & Mapping nút')}
                </span>
                {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showGuide && (
                <div className="rounded-xl bg-black/30 border border-white/10 p-4 space-y-3 text-sm animate-in fade-in slide-in-from-top-2">
                    <p className="font-semibold text-white">{t('settings.gamepad.howToUse', undefined, 'Cách sử dụng')}</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                        <li>{t('settings.gamepad.step1', undefined, 'Cắm tay cầm qua USB hoặc Bluetooth')}</li>
                        <li>{t('settings.gamepad.step2', undefined, 'Nhấn bất kỳ nút nào để trình duyệt nhận tay cầm')}</li>
                        <li>{t('settings.gamepad.step3', undefined, 'Bấm vào ô nút NES → nhấn nút trên tay cầm để gán')}</li>
                        <li>{t('settings.gamepad.step4', undefined, 'Bấm "Lưu cấu hình" để áp dụng')}</li>
                    </ol>

                    <div className="pt-2 grid sm:grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <p className="font-semibold text-white mb-1.5">🎮 Xbox / PC</p>
                            <ul className="space-y-0.5 text-muted-foreground text-xs">
                                <li><span className="text-white font-medium">A</span> → NES B &nbsp;|&nbsp; <span className="text-white font-medium">B</span> → NES A</li>
                                <li><span className="text-white font-medium">Start</span> → Start &nbsp;|&nbsp; <span className="text-white font-medium">Back</span> → Select</li>
                                <li><span className="text-white font-medium">D-Pad</span> → Di chuyển</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <p className="font-semibold text-white mb-1.5">🎮 PlayStation</p>
                            <ul className="space-y-0.5 text-muted-foreground text-xs">
                                <li><span className="text-white font-medium">✕ Cross</span> → NES B &nbsp;|&nbsp; <span className="text-white font-medium">○ Circle</span> → NES A</li>
                                <li><span className="text-white font-medium">Options</span> → Start &nbsp;|&nbsp; <span className="text-white font-medium">Share</span> → Select</li>
                                <li><span className="text-white font-medium">D-Pad</span> → Di chuyển</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-yellow-400/80 pt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{t('settings.gamepad.noteRestart', undefined, 'Lưu ý: Cấu hình mới có hiệu lực ngay khi bắt đầu game. Nếu đang chơi, hãy thoát và vào lại.')}</span>
                    </div>
                </div>
            )}

            {/* Player Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {(['p1', 'p2'] as PlayerKey[]).map(player => {
                    const pc = PLAYER_COLORS[player];
                    const isActive = activePlayer === player;
                    const label = player === 'p1'
                        ? t('settings.player1', undefined, 'Player 1')
                        : t('settings.player2', undefined, 'Player 2');
                    return (
                        <button
                            key={player}
                            type="button"
                            onClick={() => { setActivePlayer(player); setListening(null); }}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold transition-all',
                                isActive
                                    ? `${pc.bg} ${pc.text} border ${pc.border} shadow-lg`
                                    : 'bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <Gamepad2 className="w-4 h-4" />
                            {label}
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

            {/* Hint */}
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
                <span className="hidden sm:inline">{t('settings.gamepad.hint', undefined, 'Bấm vào ô nút → Nhấn nút trên tay cầm → Lưu. Nhấn Esc để hủy.')}</span>
                <span className="sm:hidden">Bấm ô nút → Nhấn tay cầm → Lưu</span>
            </p>

            {/* No gamepad warning */}
            {!connectedPad && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{t('settings.gamepad.connectFirst', undefined, 'Hãy kết nối tay cầm trước, rồi nhấn bất kỳ nút nào để trình duyệt nhận diện.')}</span>
                </div>
            )}

            {/* Button Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {NES_BUTTONS.map(btn => {
                    const isListening = listening === btn.id;
                    const currentVal = config[activePlayer][btn.id];

                    return (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={() => {
                                if (!connectedPad) return;
                                setListening(isListening ? null : btn.id);
                            }}
                            className={cn(
                                'relative group cursor-pointer transition-all duration-200 rounded-xl outline-none focus:ring-2 focus:ring-white/20',
                                !connectedPad && 'opacity-50 cursor-not-allowed',
                                isListening ? 'scale-[1.03]' : 'hover:scale-[1.02]'
                            )}
                        >
                            <div className={cn(
                                'p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all min-h-[100px]',
                                isListening
                                    ? `${colors.bg} ${colors.border} shadow-[0_0_20px_rgba(100,100,255,0.15)]`
                                    : 'bg-black/20 border-white/10 hover:border-white/20 hover:bg-white/5'
                            )}>
                                {/* NES button icon */}
                                <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white bg-gradient-to-b shadow-md',
                                    btn.color
                                )}>
                                    {btn.icon}
                                </div>

                                {/* Label */}
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                    {getButtonLabel(btn.id)}
                                </span>

                                {/* Assigned button */}
                                <div className={cn(
                                    'w-full px-2 py-1.5 flex items-center justify-center rounded-lg border text-xs font-bold transition-all text-center',
                                    isListening
                                        ? `${colors.bg} ${colors.border} ${colors.text} animate-pulse`
                                        : 'bg-black/40 border-white/10 text-white'
                                )}>
                                    {isListening ? (
                                        <span className="text-[10px] tracking-wide animate-pulse">
                                            🎮 {t('settings.gamepad.pressButton', undefined, 'Nhấn nút...')}
                                        </span>
                                    ) : (
                                        <span className="truncate leading-tight">
                                            {formatBtnIndex(currentVal as number, t)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-white/10">
                <div className="text-sm font-medium min-h-[1.5rem] flex-1">
                    {message && (
                        <span className={cn(
                            'flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 text-xs sm:text-sm',
                            saveSuccess ? 'text-emerald-400' : 'text-blue-400'
                        )}>
                            {saveSuccess && <Check className="w-4 h-4 shrink-0" />}
                            {message}
                        </span>
                    )}
                    {!message && hasChanges && (
                        <span className="text-xs text-yellow-400/70 animate-in fade-in">
                            {t('settings.unsavedChanges', undefined, '● Có thay đổi chưa lưu')}
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                        'w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r',
                        colors.accent
                    )}
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('settings.saveControls', undefined, 'Lưu cấu hình')}
                </button>
            </div>
        </div>
    );
}
