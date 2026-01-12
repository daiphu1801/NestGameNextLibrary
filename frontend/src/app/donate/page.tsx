'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { Heart, Copy, Check, CreditCard, Coffee, ExternalLink, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';

export default function DonationPage() {
    const { t } = useLanguage();
    const { isLowPerformanceMode } = usePerformance();
    const [copiedBank, setCopiedBank] = useState(false);
    const [amount, setAmount] = useState<string>('50000');
    const [message, setMessage] = useState('NestGame Donation');

    // Donation Config
    const BANK_INFO = {
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || '',
        accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || '',
        accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '',
        bin: process.env.NEXT_PUBLIC_BANK_BIN || '',
        template: process.env.NEXT_PUBLIC_BANK_TEMPLATE || ''
    };

    const PAYPAL_LINK = process.env.NEXT_PUBLIC_PAYPAL_LINK || 'https://paypal.me/nestgame';

    const getQrUrl = () => {
        // Format: https://img.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NUMBER>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
        const baseUrl = `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNumber}-${BANK_INFO.template}.png`;
        const params = new URLSearchParams();

        if (amount) params.append('amount', amount);
        if (message) params.append('addInfo', message);
        params.append('accountName', BANK_INFO.accountName);

        return `${baseUrl}?${params.toString()}`;
    };

    const handlePayPalDonate = () => {
        // Just open the PayPal link directly so user can enter amount themselves
        window.open(PAYPAL_LINK, '_blank');
    };

    const handleCopy = (text: string, setCopied: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const PRESET_AMOUNTS = [
        { value: '20000', label: '20k ☕' },
        { value: '50000', label: '50k 🍜' },
        { value: '100000', label: '100k 🚀' },
        { value: '200000', label: '200k 💎' },
    ];

    return (
        <main className="min-h-screen text-foreground relative selection:bg-primary/30">
            {/* Base background color */}
            <div className="fixed inset-0 bg-background -z-20" />

            <Header />

            {/* Background Effects - NEXUS Style */}
            {!isLowPerformanceMode && (
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div
                        className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 30%, transparent 70%)',
                            filter: 'blur(40px)',
                            animationDuration: '4s',
                        }}
                    />
                    <div
                        className="absolute top-[20%] -left-[200px] w-[500px] h-[500px] animate-float"
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 245, 212, 0.15) 0%, transparent 60%)',
                            filter: 'blur(60px)',
                        }}
                    />
                    <div
                        className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
                        style={{
                            background: 'radial-gradient(circle, rgba(255, 0, 255, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
                            filter: 'blur(80px)',
                            animationDuration: '5s',
                            animationDelay: '1s',
                        }}
                    />
                    <div
                        className="absolute -bottom-[200px] left-1/3 w-[800px] h-[400px] animate-pulse"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.12) 0%, transparent 60%)',
                            filter: 'blur(100px)',
                            animationDuration: '6s',
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundSize: '60px 60px',
                            backgroundImage: `
              linear-gradient(to right, rgba(0, 212, 255, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 212, 255, 0.06) 1px, transparent 1px)
            `,
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 10, 20, 0.4) 100%)',
                        }}
                    />
                </div>
            )
            }

            <div className="container mx-auto px-4 lg:px-8 py-12">
                {/* Header */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="p-4 rounded-full bg-pink-500/10 mb-4 ring-1 ring-pink-500/20 animate-pulse-slow">
                        <Heart className="w-12 h-12 text-pink-500 fill-pink-500/20" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-mono-tech uppercase bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-gradient mb-4">
                        {t('donate.title') || 'Support NestGame'}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        {t('donate.subtitle') || 'If you enjoy playing these classic games, consider supporting us to keep the servers running and ad-free!'}
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: QR Code + Amount Selection */}
                    <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <QrCode className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold">{t('donate.scanQr') || 'Scan to Donate'}</h2>
                        </div>

                        <div className="flex flex-col items-center w-full">
                            <div className="relative group rounded-xl overflow-hidden bg-white p-4 shadow-lg mb-6 transition-transform hover:scale-[1.02] duration-300">
                                <img
                                    src={getQrUrl()}
                                    alt="VietQR Code"
                                    className="w-full max-w-[350px] aspect-square object-contain"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm">
                                        {t('donate.openApp') || 'Open Banking App'}
                                    </span>
                                </div>
                            </div>

                            {/* Amount Selection */}
                            <div className="w-full space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                                        {t('donate.selectAmount') || 'Select Amount'}
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {PRESET_AMOUNTS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                onClick={() => setAmount(preset.value)}
                                                className={cn(
                                                    "px-2 py-2 rounded-xl text-sm font-bold border transition-all",
                                                    amount === preset.value
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                                                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                                                )}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                                            {t('donate.customAmount') || 'Custom Amount'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-8 text-foreground font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                            />
                                            <span className="absolute left-3 top-3.5 text-muted-foreground text-xs">₫</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                                            {t('donate.message') || 'Message'}
                                        </label>
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: PayPal Information */}
                    <div className="space-y-6">
                        {/* PayPal Details Card - Clickable */}
                        <div
                            onClick={handlePayPalDonate}
                            className="bg-gradient-to-br from-[#003087]/80 to-[#0070BA]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/20"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/15 transition-colors duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] animate-[shimmer_2s_infinite] group-hover:animate-none" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-[#0070BA] font-bold text-2xl italic">P</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-2xl text-white">PayPal</h3>
                                            <p className="text-sm text-white/80">Support via PayPal</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/90 text-lg font-medium leading-relaxed">
                                            Click here to donate via PayPal directly.
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-white/60 text-sm">
                                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Secure</span>
                                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Fast</span>
                                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Global</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <span className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-2">PayPal Link</span>
                                        <div className="flex items-center gap-2 bg-black/20 p-3 rounded-xl border border-white/10 group-hover:bg-black/30 transition-colors">
                                            <span className="font-mono text-base text-white truncate flex-1">
                                                {PAYPAL_LINK}
                                            </span>
                                            <div className="bg-white/20 p-1.5 rounded-lg">
                                                <ExternalLink className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Why Support Us */}
                        <div className="bg-card/30 backdrop-blur border border-white/5 rounded-3xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-pink-500" />
                                {t('donate.whySupport') || 'Why Support Us?'}
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <span>
                                        <strong>{t('donate.reason1Title')}</strong> {t('donate.reason1Desc')}
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <span>
                                        <strong>{t('donate.reason2Title')}</strong> {t('donate.reason2Desc')}
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <span>
                                        <strong>{t('donate.reason3Title')}</strong> {t('donate.reason3Desc')}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}
