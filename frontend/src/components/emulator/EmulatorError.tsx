import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface EmulatorErrorProps {
  error: string;
  onRetry: () => void;
  onClose: () => void;
}

export function EmulatorError({ error, onRetry, onClose }: EmulatorErrorProps) {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
      <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
      <p className="text-lg font-medium text-white">{t('modal.loadFailed') || 'Không thể tải game'}</p>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          {t('modal.tryAgain') || 'Thử lại'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium"
        >
          {t('modal.close') || 'Đóng'}
        </button>
      </div>
    </div>
  );
}
