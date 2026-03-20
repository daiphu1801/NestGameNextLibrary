import { useState, useEffect, useRef } from 'react';
import { emulatorService } from '@/services/emulatorService';

export function useTrialMode(isOpen: boolean, isLoggedIn: boolean, hasError: boolean, isLoading: boolean) {
  const [trialTimeLeft, setTrialTimeLeft] = useState(10);
  const [isTrialEnded, setIsTrialEnded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsTrialEnded(false);
      setTrialTimeLeft(10);
    }
  }, [isOpen, isLoggedIn]);

  useEffect(() => {
    if (isOpen && !isLoggedIn && !isLoading && !isTrialEnded && !hasError) {
      timerRef.current = setInterval(() => {
        setTrialTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTrialEnded(true);
            emulatorService.unload(); // Stop the game
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isLoggedIn, isLoading, isTrialEnded, hasError]);

  return { trialTimeLeft, isTrialEnded, setTrialTimeLeft, setIsTrialEnded };
}
