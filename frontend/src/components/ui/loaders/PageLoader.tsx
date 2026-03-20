import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({ message, className }: PageLoaderProps) {
  const { t } = useLanguage();
  const text = message || t('common.loading') || 'Loading...';

  return (
    <div className={cn("min-h-screen w-full flex flex-col items-center justify-center p-4", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground font-tech uppercase tracking-widest animate-pulse">
        {text}
      </p>
    </div>
  );
}
