import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { validatePassword } from '@/lib/passwordValidation';

export function useRegisterForm(onClose: () => void) {
    const { t } = useLanguage();
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const passwordValidation = useMemo(() => validatePassword(password), [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!passwordValidation.isValid) { setError(t('authPage.error.weakPassword') || 'Mật khẩu chưa đủ mạnh.'); return; }
        if (password !== confirmPassword) { setError(t('authPage.error.passwordMismatch') || 'Mật khẩu không khớp'); return; }
        setIsLoading(true);
        try {
            await register({ username, email, password });
            onClose();
        } catch (err: any) {
            setError(err.message || t('authPage.error.registerFailed') || 'Đăng ký thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        username, setUsername,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        showPassword, setShowPassword,
        isLoading,
        error,
        passwordValidation,
        handleSubmit,
        t
    };
}
