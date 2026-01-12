import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ===== Rate Limiting Configuration =====
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 100;    // Max 100 requests per minute per IP

// In-memory store for rate limiting (resets on server restart)
// For production, consider using Redis (e.g., @upstash/ratelimit)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
    // Try various headers that might contain the real IP
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback
    return 'unknown';
}

/**
 * Check if request should be rate limited
 */
function isRateLimited(ip: string): { limited: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    // Clean up old entries periodically (simple garbage collection)
    if (rateLimitStore.size > 10000) {
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }

    if (!record || now > record.resetTime) {
        // New window
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        // Rate limited
        return { limited: true, remaining: 0, resetIn: record.resetTime - now };
    }

    // Increment count
    record.count++;
    return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

/**
 * Security Middleware
 * - Rate limiting to prevent DDoS/spam attacks
 * - Security headers to protect against common attacks
 */
export function middleware(request: NextRequest) {
    const ip = getClientIP(request);

    // ===== Rate Limiting =====
    const { limited, remaining, resetIn } = isRateLimited(ip);

    if (limited) {
        console.warn(`[Rate Limit] IP ${ip} exceeded rate limit`);
        return new NextResponse(
            JSON.stringify({
                error: 'Too Many Requests',
                message: 'You have exceeded the rate limit. Please try again later.',
                retryAfter: Math.ceil(resetIn / 1000)
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(Math.ceil(resetIn / 1000)),
                    'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
                },
            }
        );
    }

    const response = NextResponse.next();
    const headers = response.headers;

    // ===== Rate Limit Headers =====
    headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
    headers.set('X-RateLimit-Remaining', String(remaining));

    // ===== XSS Protection =====
    // Tells browser to block page if XSS attack is detected
    headers.set('X-XSS-Protection', '1; mode=block');

    // ===== MIME Sniffing Protection =====
    // Prevents browser from MIME-sniffing away from declared content-type
    headers.set('X-Content-Type-Options', 'nosniff');

    // ===== Clickjacking Protection =====
    // Prevents site from being embedded in iframes (clickjacking)
    headers.set('X-Frame-Options', 'SAMEORIGIN');

    // ===== Referrer Policy =====
    // Controls how much referrer info is sent with requests
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // ===== Permissions Policy =====
    // Restricts access to browser features
    headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );

    return response;
}

export const config = {
    matcher: [
        // Apply to all routes except static files and images
        '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
    ],
};
