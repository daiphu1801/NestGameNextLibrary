package com.nestgame.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiting Filter to prevent brute force attacks and DDoS
 * 
 * Limits:
 * - Login endpoint: 5 attempts per minute per IP
 * - OTP endpoint: 3 requests per 10 minutes per email
 * - General: 100 requests per minute per IP
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Store request counts: IP -> (timestamp -> count)
    private final Map<String, RateLimitInfo> ipRateLimits = new ConcurrentHashMap<>();
    private final Map<String, RateLimitInfo> loginRateLimits = new ConcurrentHashMap<>();
    private final Map<String, RateLimitInfo> otpRateLimits = new ConcurrentHashMap<>();

    // Rate limit configurations
    private static final int GENERAL_LIMIT = 100; // requests per minute
    private static final int LOGIN_LIMIT = 5; // attempts per minute
    private static final int OTP_LIMIT = 3; // requests per 10 minutes
    private static final long GENERAL_WINDOW_MS = 60_000; // 1 minute
    private static final long LOGIN_WINDOW_MS = 60_000; // 1 minute
    private static final long OTP_WINDOW_MS = 600_000; // 10 minutes

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp = getClientIP(request);
        String path = request.getServletPath();

        // Check login rate limit
        if (path.equals("/auth/login") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (isRateLimited(loginRateLimits, clientIp, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
                sendRateLimitResponse(response, "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 1 phút.");
                return;
            }
        }

        // Check OTP rate limit
        if (path.equals("/auth/forgot-password") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (isRateLimited(otpRateLimits, clientIp, OTP_LIMIT, OTP_WINDOW_MS)) {
                sendRateLimitResponse(response, "Quá nhiều yêu cầu OTP. Vui lòng thử lại sau 10 phút.");
                return;
            }
        }

        // Check general rate limit
        if (isRateLimited(ipRateLimits, clientIp, GENERAL_LIMIT, GENERAL_WINDOW_MS)) {
            sendRateLimitResponse(response, "Quá nhiều request. Vui lòng thử lại sau.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(Map<String, RateLimitInfo> rateLimits, String key, int limit, long windowMs) {
        long now = System.currentTimeMillis();

        rateLimits.compute(key, (k, info) -> {
            if (info == null || now - info.windowStart > windowMs) {
                return new RateLimitInfo(now, new AtomicInteger(1));
            }
            info.count.incrementAndGet();
            return info;
        });

        RateLimitInfo info = rateLimits.get(key);
        return info != null && info.count.get() > limit;
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(String.format(
                "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"%s\"}",
                message));
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        return request.getRemoteAddr();
    }

    private static class RateLimitInfo {
        long windowStart;
        AtomicInteger count;

        RateLimitInfo(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
