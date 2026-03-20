import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function getFriendlyErrorMessage(error: string, t: (key: string) => string): { message: string; type: 'invalid_credentials' | 'network' | 'generic' } {
    const lowerError = error.toLowerCase();
    if (lowerError.includes('user not found') || lowerError.includes('không tìm thấy') || lowerError.includes('not exist') ||
        lowerError.includes('invalid password') || lowerError.includes('wrong password') || lowerError.includes('sai mật khẩu') || lowerError.includes('bad credentials')) {
        return { message: t('authPage.error.invalidCredentials') || 'Email hoặc mật khẩu không đúng.', type: 'invalid_credentials' };
    }
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection') || lowerError.includes('server')) {
        return { message: t('authPage.error.network') || 'Không thể kết nối server.', type: 'network' };
    }
    return { message: error || t('authPage.error.generic') || 'Đăng nhập thất bại.', type: 'generic' };
}

export function useLoginForm(onClose: () => void) {
    const { t } = useLanguage();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorInfo, setErrorInfo] = useState<{ message: string; type: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorInfo(null);
        setIsLoading(true);
        try {
            await login({ login: email, password }, rememberMe);
            onClose();
        } catch (err: any) {
            setErrorInfo(getFriendlyErrorMessage(err.message || 'Unknown error', t));
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email, setEmail,
        password, setPassword,
        rememberMe, setRememberMe,
        showPassword, setShowPassword,
        isLoading,
        errorInfo,
        handleSubmit,
        t
    };
}
