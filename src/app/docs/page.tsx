'use client';

import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ArrowLeft, Book, Gamepad2, Keyboard, Save, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative">
            {/* Base background */}
            <div className="fixed inset-0 bg-background -z-20" />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div
                    className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px]"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundSize: '60px 60px',
                        backgroundImage: `
              linear-gradient(to right, rgba(0, 212, 255, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 212, 255, 0.04) 1px, transparent 1px)
            `,
                    }}
                />
            </div>

            <Header />

            <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('nav.home')}</span>
                </Link>

                {/* Page Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="p-4 rounded-2xl bg-primary/20 border border-primary/30">
                        <Book className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-mono-tech uppercase tracking-tight">
                            {t('docs.title')}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {t('docs.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Documentation Content */}
                <div className="space-y-12">
                    {/* Getting Started */}
                    <section className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">{t('docs.gettingStarted.title')}</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <p>{t('docs.gettingStarted.welcome')}</p>
                            <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>{t('docs.gettingStarted.step1')}</li>
                                <li>{t('docs.gettingStarted.step2')}</li>
                                <li>{t('docs.gettingStarted.step3')}</li>
                                <li>{t('docs.gettingStarted.step4')}</li>
                            </ol>
                        </div>
                    </section>

                    {/* Controls */}
                    <section className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Keyboard className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">{t('docs.controls.title')}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <h3 className="font-semibold text-foreground">{t('docs.controls.movement')}</h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>{t('docs.controls.up')}</span>
                                        <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">↑ / W</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('docs.controls.down')}</span>
                                        <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">↓ / S</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('docs.controls.left')}</span>
                                        <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">← / A</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('docs.controls.right')}</span>
                                        <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">→ / D</kbd>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-semibold text-foreground">{t('docs.controls.actions')}</h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>{t('docs.controls.aButton')}</span>
                                        <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">X / J</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('docs.controls.bButton')}</span>
                                        <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">Z / K</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('docs.controls.start')}</span>
                                        <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">Enter</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('docs.controls.select')}</span>
                                        <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">Shift</kbd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Save States */}
                    <section className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Save className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">{t('docs.saveStates.title')}</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <p>{t('docs.saveStates.description')}</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>{t('docs.saveStates.save')}</li>
                                <li>{t('docs.saveStates.load')}</li>
                                <li>{t('docs.saveStates.quick')}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Gamepad */}
                    <section className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Gamepad2 className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">{t('docs.gamepad.title')}</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <p>{t('docs.gamepad.description')}</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>{t('docs.gamepad.xbox')}</li>
                                <li>{t('docs.gamepad.playstation')}</li>
                                <li>{t('docs.gamepad.switch')}</li>
                                <li>{t('docs.gamepad.generic')}</li>
                            </ul>
                            <p className="text-sm">{t('docs.gamepad.note')}</p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
