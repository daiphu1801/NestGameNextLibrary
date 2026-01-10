'use client';

import { Github, Heart, Code, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/5 bg-background/80 backdrop-blur-xl mt-auto">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12">
                                <img
                                    src="/game-console.png"
                                    alt="NestGame Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h3 className="font-black text-lg font-mono-tech">
                                    <span className="text-gradient-cyan">NEST</span>
                                    <span className="text-foreground">GAME</span>
                                </h3>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Classic NES Emulator</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t('footer.description') || 'Nền tảng chơi game NES kinh điển trực tuyến. Hơn 1700+ game miễn phí, không cần cài đặt.'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">{t('footer.quickLinks') || 'Liên kết nhanh'}</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    {t('nav.home') || 'Trang chủ'}
                                </Link>
                            </li>
                            <li>
                                <Link href="/library" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    {t('nav.library') || 'Thư viện'}
                                </Link>
                            </li>
                            <li>
                                <Link href="/favorites" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    {t('nav.favorites') || 'Yêu thích'}
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    {t('nav.docs') || 'Hướng dẫn'}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Developer Info */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">{t('footer.developer') || 'Nhà phát triển'}</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10">
                                    <Code className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">Bùi Đại Phú</p>
                                    <p className="text-xs text-muted-foreground">@daiphu1801</p>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                                Student at Hanoi University of Civil Engineering
                            </p>

                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent/60"></span>
                                Java Spring Boot | Web Development | Blockchain
                            </p>

                            <div className="flex items-center gap-3 pt-2">
                                <Link
                                    href="https://github.com/daiphu1801"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-white/10 hover:border-primary/30 transition-all text-sm group"
                                >
                                    <Github className="w-4 h-4 group-hover:text-primary transition-colors" />
                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">GitHub</span>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-white/5 flex flex-col items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                        {/* Copyright */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono-tech">
                            <span>© {currentYear} NestGame.</span>
                            <span className="hidden md:inline">•</span>
                            <span>{t('footer.rights') || 'All rights reserved.'}</span>
                        </div>

                        {/* Made with love */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{t('footer.madeWith') || 'Made with'}</span>
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                            <span className="text-muted-foreground">{t('footer.inVietnam') || 'in Vietnam'}</span>
                        </div>
                    </div>

                    {/* UI Design Credit */}
                    <div className="text-xs text-muted-foreground/60 text-center space-y-1">
                        <div>
                            <span>UI Design inspired by </span>
                            <Link
                                href="https://ui-ux-pro-max-skill.nextlevelbuilder.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary/70 hover:text-primary transition-colors"
                            >
                                NextLevelBuilder.io
                            </Link>
                        </div>
                        <div>
                            <span>Icons by </span>
                            <Link
                                href="https://www.flaticon.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary/70 hover:text-primary transition-colors"
                            >
                                Flaticon
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
