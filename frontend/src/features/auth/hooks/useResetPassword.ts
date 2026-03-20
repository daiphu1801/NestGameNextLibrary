import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export type ResetStep = 'email' | 'otp' | 'password' | 'success';

export function useResetPassword() {
  const router = useRouter();

  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleVerifyOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Mã OTP không chính xác.');
    } finally {
      setIsLoading(false);
    }
  }, [email, otp]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Mật khẩu không khớp'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setStep('success');
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [email, otp, newPassword, confirmPassword, router]);

  const goBack = useCallback(() => {
    if (step === 'otp') setStep('email');
    else if (step === 'password') setStep('otp');
  }, [step]);

  const resendOtp = useCallback(() => {
    setError('');
    handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  }, [handleSendOtp]);

  const canGoBack = step === 'otp' || step === 'password';

  return {
    step, email, setEmail, otp, setOtp,
    newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    isLoading, error,
    handleSendOtp, handleVerifyOtp, handleResetPassword,
    goBack, canGoBack, resendOtp,
  };
}
