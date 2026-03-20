import { LogIn } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface TrialEndedOverlayProps {
  gameName: string;
  onLoginClick: () => void;
  onClose: () => void;
}

export function TrialEndedOverlay({ gameName, onLoginClick, onClose }: TrialEndedOverlayProps) {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-20 animate-in fade-in duration-300">
      <div className="relative p-8 bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8 text-primary" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">{t('trial.loginRequired') || 'Login Required'}</h3>
        <p className="text-muted-foreground mb-8">
          {t('trial.desc', { gameName }) || `Your 10-second trial has ended. Please login to continue playing ${gameName}.`}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onLoginClick}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {t('trial.loginToContinue') || 'Login to Continue'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
          >
            {t('trial.closeGame') || 'Close Game'}
          </button>
        </div>
      </div>
    </div>
  );
}
