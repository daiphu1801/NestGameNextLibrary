'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';

type Locale = 'en' | 'vi';
type Messages = typeof en;

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
    en,
    vi: vi as unknown as Messages,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');

    // Load saved locale from local storage on mount
    useEffect(() => {
        const savedLocale = localStorage.getItem('nestgame-locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) {
            setLocale(savedLocale);
        }
    }, []);

    const changeLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem('nestgame-locale', newLocale);
    };

    const t = (path: string, params?: Record<string, string | number>) => {
        const keys = path.split('.');
        let current: any = messages[locale];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in locale: ${locale}`);
                return path;
            }
            current = current[key];
        }

        let value = current as string;

        // Replace parameters
        if (params) {
            Object.entries(params).forEach(([key, val]) => {
                value = value.replace(new RegExp(`{${key}}`, 'g'), String(val));
            });
        }

        return value;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
