package com.nestgame.service;

import com.nestgame.dto.response.OtpResponse;
import com.nestgame.entity.PasswordResetOtp;
import com.nestgame.repository.PasswordResetOtpRepository;
import com.nestgame.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final PasswordResetOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generate a 6-digit OTP code
     */
    private String generateOtpCode() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Send OTP to user's email for password reset
     */
    @Transactional
    public OtpResponse sendOtp(String email) {
        // Check if user exists
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        // Delete old OTPs for this email
        otpRepository.deleteByEmail(email);

        // Generate new OTP
        String otpCode = generateOtpCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        // Save OTP (hashed)
        PasswordResetOtp otp = PasswordResetOtp.builder()
                .email(email)
                .otpCode(passwordEncoder.encode(otpCode))
                .expiresAt(expiresAt)
                .verified(false)
                .attempts(0)
                .maxAttempts(3)
                .build();

        otpRepository.save(otp);

        // Send email with plain OTP code
        emailService.sendOtpEmail(email, user.getUsername(), otpCode);

        log.info("OTP sent to email: {}", email);

        return OtpResponse.builder()
                .success(true)
                .message("Mã OTP đã được gửi đến email của bạn")
                .expiresAt(expiresAt)
                .build();
    }

    /**
     * Verify OTP code
     */
    @Transactional
    public OtpResponse verifyOtp(String email, String otpCode) {
        // Find most recent unverified OTP
        PasswordResetOtp otp = otpRepository.findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới"));

        // Check if expired
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otp);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới");
        }

        // Check max attempts
        if (otp.getAttempts() >= otp.getMaxAttempts()) {
            otpRepository.delete(otp);
            throw new RuntimeException("Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới");
        }

        // Verify OTP code
        if (!passwordEncoder.matches(otpCode, otp.getOtpCode())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);

            int remainingAttempts = otp.getMaxAttempts() - otp.getAttempts();
            throw new RuntimeException("Mã OTP không chính xác. Còn " + remainingAttempts + " lần thử");
        }

        // Mark as verified
        otp.setVerified(true);
        otpRepository.save(otp);

        log.info("OTP verified successfully for email: {}", email);

        return OtpResponse.builder()
                .success(true)
                .message("Xác thực OTP thành công")
                .build();
    }

    /**
     * Check if OTP is verified for reset password
     */
    @Transactional(readOnly = true)
    public boolean isOtpVerified(String email) {
        return otpRepository.findFirstByEmailAndVerifiedTrueOrderByCreatedAtDesc(email).isPresent();
    }

    /**
     * Cleanup expired OTPs
     */
    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteExpiredOtps(LocalDateTime.now());
        log.info("Cleaned up expired OTPs");
    }
}
