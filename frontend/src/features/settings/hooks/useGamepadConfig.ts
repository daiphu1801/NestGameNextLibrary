import { useState, useEffect, useRef } from 'react';
import { emulatorService, DEFAULT_GAMEPAD_MAPPING } from '@/services/emulatorService';
import type { GamepadConfig } from '@/types/emulator';
import { useLanguage } from '@/components/providers/LanguageProvider';

type PlayerKey = 'p1' | 'p2';
type NesButton = keyof Omit<GamepadConfig['p1'], 'useAxis'>;

export function useGamepadConfig() {
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
        const timer = setTimeout(() => { pollRef.current = requestAnimationFrame(poll); }, 300);
        return () => {
            clearTimeout(timer);
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
        setMessage(`${label}: ${t('settings.controlsReset', undefined, 'Đã khôi phục mặc định.')}`);
    };

    const getButtonLabel = (id: string) => {
        const m: Record<string, string> = {
            up: t('settings.keyUp', undefined, 'Lên'),
            down: t('settings.keyDown', undefined, 'Xuống'),
            left: t('settings.keyLeft', undefined, 'Trái'),
            right: t('settings.keyRight', undefined, 'Phải'),
            a: t('settings.keyA', undefined, 'Nút A'),
            b: t('settings.keyB', undefined, 'Nút B'),
            x: t('settings.keyX', undefined, 'Button X'), y: t('settings.keyY', undefined, 'Button Y'), l: t('settings.keyL', undefined, 'Button L'), r: t('settings.keyR', undefined, 'Button R'),
            start: t('settings.keyStart', undefined, 'Start'),
            select: t('settings.keySelect', undefined, 'Select'),
        };
        return m[id] || id;
    };

    return {
        config,
        activePlayer,
        setActivePlayer,
        listening,
        setListening,
        isSaving,
        saveSuccess,
        message,
        hasChanges,
        showGuide,
        setShowGuide,
        connectedPad,
        handleSave,
        handleReset,
        getButtonLabel,
        t
    };
}
