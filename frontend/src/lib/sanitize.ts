/**
 * Security Utilities for Input Sanitization
 * Provides defense-in-depth for user input handling
 */

/**
 * Sanitize user input for search queries
 * Prevents potential injection attacks and DoS via long strings
 */
export function sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
        return '';
    }

    return query
        // Trim whitespace
        .trim()
        // Remove null bytes (common in injection attacks)
        .replace(/\0/g, '')
        // Limit length to prevent DoS
        .slice(0, 200)
        // Remove control characters
        .replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Validate filter values against allowed list
 * Prevents injection of arbitrary filter values
 */
export function isValidFilter(
    value: string,
    allowedValues: readonly string[]
): boolean {
    if (!value || typeof value !== 'string') {
        return false;
    }
    return allowedValues.includes(value);
}

/**
 * Escape HTML special characters to prevent XSS
 * Use this when displaying user input in non-React contexts
 */
export function escapeHtml(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}
