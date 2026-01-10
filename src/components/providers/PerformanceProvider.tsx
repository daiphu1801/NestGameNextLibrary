'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PerformanceContextType {
    isLowPerformanceMode: boolean;
    togglePerformanceMode: () => void;
    setLowPerformanceMode: (value: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

const STORAGE_KEY = 'nestgame-low-performance-mode';

export function PerformanceProvider({ children }: { children: ReactNode }) {
    const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);

    // Load preference from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'true') {
            setIsLowPerformanceMode(true);
        }
    }, []);

    // Apply/remove low-performance class to body
    useEffect(() => {
        if (isLowPerformanceMode) {
            document.body.classList.add('low-performance-mode');
        } else {
            document.body.classList.remove('low-performance-mode');
        }
    }, [isLowPerformanceMode]);

    const togglePerformanceMode = () => {
        const newValue = !isLowPerformanceMode;
        setIsLowPerformanceMode(newValue);
        localStorage.setItem(STORAGE_KEY, String(newValue));
    };

    const setLowPerformanceMode = (value: boolean) => {
        setIsLowPerformanceMode(value);
        localStorage.setItem(STORAGE_KEY, String(value));
    };

    return (
        <PerformanceContext.Provider
            value={{
                isLowPerformanceMode,
                togglePerformanceMode,
                setLowPerformanceMode,
            }}
        >
            {children}
        </PerformanceContext.Provider>
    );
}

export function usePerformance() {
    const context = useContext(PerformanceContext);
    if (context === undefined) {
        throw new Error('usePerformance must be used within a PerformanceProvider');
    }
    return context;
}
