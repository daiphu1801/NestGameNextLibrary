package com.nestgame.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    @Value("${app.cookie.secure:false}")
    private boolean secure;

    @Value("${app.cookie.domain:}")
    private String domain;

    private static final String ACCESS_TOKEN_COOKIE = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    public void setAccessTokenCookie(HttpServletResponse response, String token, int maxAgeSeconds) {
        addCookie(response, ACCESS_TOKEN_COOKIE, token, maxAgeSeconds, "/");
    }

    public void setRefreshTokenCookie(HttpServletResponse response, String token, int maxAgeSeconds) {
        addCookie(response, REFRESH_TOKEN_COOKIE, token, maxAgeSeconds, "/");
    }

    public void clearAuthCookies(HttpServletResponse response) {
        addCookie(response, ACCESS_TOKEN_COOKIE, "", 0, "/");
        addCookie(response, REFRESH_TOKEN_COOKIE, "", 0, "/");
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge, String path) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath(path);
        cookie.setMaxAge(maxAge);
        if (domain != null && !domain.isEmpty()) {
            cookie.setDomain(domain);
        }
        // SameSite via header (Cookie API doesn't support SameSite directly)
        String sameSite = secure ? "None" : "Lax";
        String header = String.format("%s=%s; Path=%s; Max-Age=%d; HttpOnly; SameSite=%s%s",
                name, value, path, maxAge, sameSite, secure ? "; Secure" : "");
        response.addHeader("Set-Cookie", header);
    }
}
