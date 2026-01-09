
import { Github, Heart } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-background/50 backdrop-blur-xl py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">

                {/* Copyright */}
                <div className="flex flex-col md:flex-row items-center gap-2 text-muted-foreground font-mono-tech opacity-70">
                    <span>© {new Date().getFullYear()} NESTGAME LIBRARY.</span>
                    <span className="hidden md:inline">•</span>
                    <span>All rights reserved.</span>
                </div>

                {/* Designer Credit */}
                <div className="flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-full border border-white/5 hover:border-primary/20 transition-colors">
                    <span className="text-muted-foreground">Designed with</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-rose-500" />
                    <span className="text-muted-foreground">by</span>
                    <Link
                        href="https://github.com/daiphu1801"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-foreground font-bold hover:text-primary transition-all group"
                    >
                        <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent group-hover:opacity-80">daiphu1801</span>
                        <Github className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
                    </Link>
                </div>

            </div>
        </footer>
    );
}
