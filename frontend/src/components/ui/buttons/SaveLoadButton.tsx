import { Save, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface SaveLoadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: 'save' | 'load';
}

export function SaveLoadButton({ action, className, children, ...props }: SaveLoadButtonProps) {
  const { t } = useLanguage();
  const isSave = action === 'save';
  
  const Icon = isSave ? Save : FolderOpen;
  const defaultText = isSave 
    ? (t('saveState.save') || 'Save')
    : (t('saveState.load') || 'Load');

  return (
    <button
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm border",
        isSave 
          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
          : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20",
        className
      )}
      {...props}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{children || defaultText}</span>
    </button>
  );
}
