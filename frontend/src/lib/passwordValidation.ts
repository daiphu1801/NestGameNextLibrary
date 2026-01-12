// Password validation utilities

export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    checks: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecialChar: boolean;
    };
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (@$!%*?&)
 */
export function validatePassword(password: string): PasswordValidation {
    const checks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[@$!%*?&]/.test(password),
    };

    const errors: string[] = [];

    if (!checks.minLength) errors.push('Tối thiểu 8 ký tự');
    if (!checks.hasUppercase) errors.push('Ít nhất 1 chữ hoa (A-Z)');
    if (!checks.hasLowercase) errors.push('Ít nhất 1 chữ thường (a-z)');
    if (!checks.hasNumber) errors.push('Ít nhất 1 số (0-9)');
    if (!checks.hasSpecialChar) errors.push('Ít nhất 1 ký tự đặc biệt (@$!%*?&)');

    const passedChecks = Object.values(checks).filter(Boolean).length;

    let strength: PasswordValidation['strength'] = 'weak';
    if (passedChecks >= 5) strength = 'very-strong';
    else if (passedChecks >= 4) strength = 'strong';
    else if (passedChecks >= 3) strength = 'medium';

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        checks,
    };
}

/**
 * Get color class for password strength indicator
 */
export function getStrengthColor(strength: PasswordValidation['strength']): string {
    switch (strength) {
        case 'very-strong': return 'bg-green-500';
        case 'strong': return 'bg-blue-500';
        case 'medium': return 'bg-yellow-500';
        default: return 'bg-red-500';
    }
}

/**
 * Get label for password strength
 */
export function getStrengthLabel(strength: PasswordValidation['strength']): string {
    switch (strength) {
        case 'very-strong': return 'Rất mạnh';
        case 'strong': return 'Mạnh';
        case 'medium': return 'Trung bình';
        default: return 'Yếu';
    }
}
