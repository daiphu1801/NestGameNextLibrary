'use client';

import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ArrowLeft, Book, Gamepad2, Keyboard, Zap, Settings, Lightbulb } from 'lucide-react';
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
                        <h1 className="text-4xl font-black font-tech uppercase tracking-tight">
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

                        {/* Player 1 */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">{t('docs.controls.player1')}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-foreground text-sm">{t('docs.controls.movement')}</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.up')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">W</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.down')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">S</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.left')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">A</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.right')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">D</kbd>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-foreground text-sm">{t('docs.controls.actions')}</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.aButton')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">J</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.bButton')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">K</kbd>
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
                        </div>

                        <div className="h-px bg-white/10 my-6" />

                        {/* Player 2 */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1 rounded-full">{t('docs.controls.player2')}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-foreground text-sm">{t('docs.controls.movement')}</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.up')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">↑</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.down')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">↓</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.left')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">←</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.right')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">→</kbd>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-foreground text-sm">{t('docs.controls.actions')}</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.aButton')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">1</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.bButton')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">2</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.start')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">3</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('docs.controls.select')}</span>
                                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">4</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Custom Controls */}
                    <section className="glass-card rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="w-6 h-6 text-emerald-400" />
                            <h2 className="text-2xl font-bold">{t('docs.customControls.title')}</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <p>{t('docs.customControls.description')}</p>
                            <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>{t('docs.customControls.step1')}</li>
                                <li>{t('docs.customControls.step2')}</li>
                                <li>{t('docs.customControls.step3')}</li>
                                <li>{t('docs.customControls.step4')}</li>
                            </ol>

                            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-sm text-emerald-400">{t('docs.customControls.note')}</p>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                                    <h3 className="font-semibold text-foreground text-sm">{t('docs.customControls.tips')}</h3>
                                </div>
                                <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                                    <li>{t('docs.customControls.tip1')}</li>
                                    <li>{t('docs.customControls.tip2')}</li>
                                    <li>{t('docs.customControls.tip3')}</li>
                                </ul>
                            </div>

                            <div className="mt-4">
                                <Link
                                    href="/settings"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm font-medium"
                                >
                                    <Settings className="w-4 h-4" />
                                    {t('settings.controls') || 'Game Controls'}
                                </Link>
                            </div>
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
