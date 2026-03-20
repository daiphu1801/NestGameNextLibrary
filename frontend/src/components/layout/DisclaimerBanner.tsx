import Link from 'next/link';
import { BookOpen, X } from 'lucide-react';

interface DisclaimerBannerProps {
  show: boolean;
  onDismiss: () => void;
}

export function DisclaimerBanner({ show, onDismiss }: DisclaimerBannerProps) {
  if (!show) return null;

  return (
    <div className="sticky top-0 z-[51] w-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-2">
          <Link href="/docs" className="flex items-center gap-2.5 flex-1 min-w-0 group" onClick={onDismiss}>
            <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs sm:text-sm text-foreground/80 truncate">
              <span className="font-semibold text-primary">Hướng dẫn:</span>{' '}
              <span className="group-hover:text-primary transition-colors">Tìm hiểu cách chơi, cấu hình phím và các tính năng của NestGame →</span>
            </p>
          </Link>
          <button
            onClick={onDismiss}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all flex-shrink-0 cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
