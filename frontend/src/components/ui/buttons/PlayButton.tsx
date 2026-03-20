import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface PlayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'compact';
  fullWidth?: boolean;
}

export function PlayButton({ 
  variant = 'primary', 
  fullWidth = false,
  className, 
  children,
  ...props 
}: PlayButtonProps) {
  const { t } = useLanguage();
  const defaultText = t('game.playNow') || 'Play Now';

  return (
    <button
      className={cn(
        "flex items-center justify-center transition-all duration-300",
        fullWidth ? "w-full" : "",
        variant === 'primary' && "gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/50 hover:bg-primary/90 hover:scale-105 active:scale-95",
        variant === 'secondary' && "gap-2 px-4 py-2 rounded-full bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 backdrop-blur-md",
        variant === 'compact' && "gap-1 h-9 px-3 rounded-lg bg-primary text-white text-[11px] whitespace-nowrap hover:bg-primary/90 active:scale-95",
        className
      )}
      {...props}
    >
      <Play className={cn(
        "fill-current flex-shrink-0",
        variant === 'compact' ? "w-3 h-3" : "w-4 h-4"
      )} />
      {children || defaultText}
    </button>
  );
}
