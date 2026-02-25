package com.nestgame.controller;

import com.nestgame.dto.request.ChangePasswordRequest;
import com.nestgame.dto.request.ForgotPasswordRequest;
import com.nestgame.dto.request.LoginRequest;
import com.nestgame.dto.request.RegisterRequest;
import com.nestgame.dto.request.ResetPasswordWithOtpRequest;
import com.nestgame.dto.request.VerifyOtpRequest;
import com.nestgame.dto.response.AuthResponse;
import com.nestgame.dto.response.OtpResponse;
import com.nestgame.entity.User;
import com.nestgame.service.AuthService;
import com.nestgame.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @Value("${jwt.expiration:86400000}")
    private long accessTokenExpiration; // ms

    @Value("${jwt.refresh-token.expiration:604800000}")
    private long refreshTokenExpiration; // ms

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        setAuthCookies(response, authResponse);
        // Return user info only, tokens are in HttpOnly cookies
        return ResponseEntity.ok(Map.of("user", authResponse.getUser()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(Map.of("user", authResponse.getUser()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshTokenCookie,
            HttpServletResponse response) {
        if (refreshTokenCookie == null || refreshTokenCookie.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "No refresh token"));
        }
        AuthResponse authResponse = authService.refreshAccessToken(refreshTokenCookie);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(Map.of("user", authResponse.getUser()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        cookieUtil.clearAuthCookies(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<OtpResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.requestPasswordReset(request.getEmail()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<OtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request.getEmail(), request.getOtpCode()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordWithOtpRequest request) {
        authService.resetPasswordWithOtp(request.getEmail(), request.getOtpCode(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            java.security.Principal connectedUser) {
        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();
        authService.changePassword(user, request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    private void setAuthCookies(HttpServletResponse response, AuthResponse authResponse) {
        int accessMaxAge = (int) (accessTokenExpiration / 1000); // ms to seconds
        int refreshMaxAge = (int) (refreshTokenExpiration / 1000);
        cookieUtil.setAccessTokenCookie(response, authResponse.getAccessToken(), accessMaxAge);
        cookieUtil.setRefreshTokenCookie(response, authResponse.getRefreshToken(), refreshMaxAge);
    }
}
