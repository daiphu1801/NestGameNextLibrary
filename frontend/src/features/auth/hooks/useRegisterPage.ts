import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { validatePassword } from '@/lib/passwordValidation';

export function useRegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { register, user } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const passwordsMatch = password === confirmPassword;

  useEffect(() => { if (user) router.push('/'); }, [user, router]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passwordValidation.isValid) {
      setError(t('authPage.error.weakPassword') || 'Mật khẩu chưa đủ mạnh.');
      return;
    }
    if (!passwordsMatch) {
      setError(t('authPage.error.passwordMismatch') || 'Mật khẩu xác nhận không khớp');
      return;
    }
    setIsLoading(true);
    try {
      await register({ username, email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.message || t('authPage.error.registerFailed') || 'Đăng ký thất bại.');
    } finally {
      setIsLoading(false);
    }
  }, [username, email, password, passwordValidation.isValid, passwordsMatch, register, router, t]);

  return {
    username, setUsername, email, setEmail,
    password, setPassword, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    isLoading, error, user, t,
    passwordValidation, passwordsMatch,
    handleSubmit,
  };
}
