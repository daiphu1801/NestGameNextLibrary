import { useState, useEffect, useCallback } from 'react';
import { emulatorService, DEFAULT_KEYBINDINGS } from '@/services/emulatorService';
import type { KeybindingConfig } from '@/types/emulator';
import { useLanguage } from '@/components/providers/LanguageProvider';

type PlayerKey = 'p1' | 'p2';

const mapKeyToRetroArch = (e: KeyboardEvent): string => {
    const key = e.key;
    const code = e.code;
    if (code.startsWith('Numpad') && /^Numpad\d$/.test(code)) {
        return `keypad${code.at(-1)}`;
    }
    if (key.length === 1) return key.toLowerCase();
    switch (key) {
        case 'ArrowUp': return 'up';
        case 'ArrowDown': return 'down';
        case 'ArrowLeft': return 'left';
        case 'ArrowRight': return 'right';
        case 'Enter': return code === 'NumpadEnter' ? 'kp_enter' : 'enter';
        case ' ': return 'space';
        case 'Shift': return e.location === 2 ? 'rshift' : 'lshift';
        case 'Control': return e.location === 2 ? 'rctrl' : 'lctrl';
        case 'Alt': return e.location === 2 ? 'ralt' : 'lalt';
        case 'Escape': return 'escape';
        case 'Tab': return 'tab';
        case 'Backspace': return 'backspace';
        case 'CapsLock': return 'capslock';
        case 'Delete': return 'del';
        default: return key.toLowerCase();
    }
};

export function useKeybindingConfig() {
    const { t } = useLanguage();
    const [config, setConfig] = useState<KeybindingConfig>(DEFAULT_KEYBINDINGS);
    const [activePlayer, setActivePlayer] = useState<PlayerKey>('p1');
    const [listeningButton, setListeningButton] = useState<keyof KeybindingConfig['p1'] | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const stored = emulatorService.getKeybindings();
        setConfig(stored);
    }, []);

    const getConflicts = useCallback((player: PlayerKey): Set<string> => {
        const keys = config[player];
        const seen = new Map<string, string[]>();
        for (const [btnId, key] of Object.entries(keys)) {
            if (!seen.has(key)) seen.set(key, []);
            seen.get(key)!.push(btnId);
        }
        const conflicted = new Set<string>();
        for (const buttons of seen.values()) {
            if (buttons.length > 1) buttons.forEach(b => conflicted.add(b));
        }
        return conflicted;
    }, [config]);

    const p1Conflicts = getConflicts('p1');
    const p2Conflicts = getConflicts('p2');
    const activeConflicts = activePlayer === 'p1' ? p1Conflicts : p2Conflicts;
    const hasAnyConflicts = p1Conflicts.size > 0 || p2Conflicts.size > 0;

    useEffect(() => {
        if (!listeningButton) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.key === 'Escape') { setListeningButton(null); return; }

            const retroKey = mapKeyToRetroArch(e);
            setConfig(prev => ({
                ...prev,
                [activePlayer]: { ...prev[activePlayer], [listeningButton]: retroKey }
            }));
            setHasUnsavedChanges(true);
            setListeningButton(null);
        };

        const handleMouseDown = () => setListeningButton(null);
        window.addEventListener('keydown', handleKeyDown);
        const timeout = setTimeout(() => window.addEventListener('mousedown', handleMouseDown), 200);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleMouseDown);
            clearTimeout(timeout);
        };
    }, [listeningButton, activePlayer]);

    const handleSave = async () => {
        if (hasAnyConflicts) {
            setMessage(t('settings.controlsConflictError', undefined, 'Có phím bị trùng! Vui lòng sửa trước khi lưu.'));
            return;
        }
        setIsSaving(true);
        setMessage('');
        setSaveSuccess(false);
        try {
            await emulatorService.saveKeybindings(config);
            setHasUnsavedChanges(false);
            setSaveSuccess(true);
            setMessage(t('settings.controlsSaved', undefined, 'Đã lưu cấu hình phím!'));
            setTimeout(() => { setMessage(''); setSaveSuccess(false); }, 3000);
        } catch (error) {
            console.error(error);
            setMessage(t('settings.controlsSaveError', undefined, 'Không thể lưu cấu hình'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setConfig(prev => ({ ...prev, [activePlayer]: DEFAULT_KEYBINDINGS[activePlayer] }));
        setListeningButton(null);
        setHasUnsavedChanges(true);
        const playerLabel = activePlayer === 'p1' ? t('settings.player1', undefined, 'Player 1') : t('settings.player2', undefined, 'Player 2');
        setMessage(`${playerLabel}: ${t('settings.controlsReset', undefined, 'Đã khôi phục mặc định.')}`);
    };

    return {
        config,
        activePlayer,
        setActivePlayer,
        listeningButton,
        setListeningButton,
        isSaving,
        saveSuccess,
        message,
        hasUnsavedChanges,
        p1Conflicts,
        p2Conflicts,
        activeConflicts,
        hasAnyConflicts,
        handleSave,
        handleReset,
        t
    };
}
