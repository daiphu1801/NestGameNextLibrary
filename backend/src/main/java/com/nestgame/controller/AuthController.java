package com.nestgame.controller;

import com.nestgame.dto.request.*;
import com.nestgame.dto.response.AuthResponse;
import com.nestgame.dto.response.OtpResponse;
import com.nestgame.entity.User;
import com.nestgame.service.AuthService;
import com.nestgame.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    /**
     * Helper method to safely extract User from Principal
     */
    private User extractUser(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        if (principal instanceof UsernamePasswordAuthenticationToken authToken) {
            Object userObj = authToken.getPrincipal();
            if (userObj instanceof User user) {
                return user;
            }
            throw new RuntimeException("Invalid user type in security context: " + userObj.getClass().getName());
        }

        throw new RuntimeException("Invalid authentication type: " + principal.getClass().getName());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshAccessToken(request.getRefreshToken()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal connectedUser) {
        User user = extractUser(connectedUser);
        authService.changePassword(user, request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    // =================== OTP PASSWORD RESET ===================

    /**
     * Step 1: Send OTP to user's email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<OtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        OtpResponse response = otpService.sendOtp(request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2: Verify OTP code
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<OtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        OtpResponse response = otpService.verifyOtp(request.getEmail(), request.getOtpCode());
        return ResponseEntity.ok(response);
    }

    /**
     * Step 3: Reset password after OTP verification
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordWithOtpRequest request) {
        // Check if OTP was verified
        if (!otpService.isOtpVerified(request.getEmail())) {
            throw new RuntimeException("OTP chưa được xác thực. Vui lòng xác thực OTP trước");
        }

        // Reset password
        authService.resetPasswordByEmail(request.getEmail(), request.getNewPassword());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới"));
    }
}
