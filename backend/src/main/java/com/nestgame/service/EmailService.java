package com.nestgame.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String username, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🎮 NestGame - Đặt lại mật khẩu");
            helper.setText(buildPasswordResetEmailTemplate(username, resetToken), true);

            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    private String buildPasswordResetEmailTemplate(String username, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Đặt lại mật khẩu - NestGame</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0a0f1e 0%, #1a1f2e 100%); min-height: 100vh;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #0a0f1e 0%, #1a1f2e 100%); padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <!-- Main Container -->
                                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: rgba(17, 25, 40, 0.95); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);">

                                    <!-- Header with Gradient -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">
                                                🎮 NestGame
                                            </h1>
                                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                                                Nền tảng game NES huyền thoại
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Content Body -->
                                    <tr>
                                        <td style="padding: 40px 30px; background: rgba(17, 25, 40, 0.95);">
                                            <h2 style="margin: 0 0 20px; color: #06b6d4; font-size: 24px; font-weight: 700;">
                                                Đặt lại mật khẩu 🔐
                                            </h2>

                                            <p style="margin: 0 0 16px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                                                Xin chào <strong style="color: #06b6d4;">%s</strong>,
                                            </p>

                                            <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản NestGame của bạn.
                                                Nhấn vào nút bên dưới để tạo mật khẩu mới:
                                            </p>

                                            <!-- CTA Button -->
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="%s"
                                                           style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3); transition: all 0.3s ease;">
                                                            ✨ ĐẶT LẠI MẬT KHẨU
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Alternative Link -->
                                            <div style="margin: 32px 0; padding: 20px; background: rgba(6, 182, 212, 0.05); border-left: 4px solid #06b6d4; border-radius: 8px;">
                                                <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Hoặc sao chép link này:
                                                </p>
                                                <a href="%s" style="color: #06b6d4; font-size: 13px; word-break: break-all; text-decoration: none;">
                                                    %s
                                                </a>
                                            </div>

                                            <!-- Warning Box -->
                                            <div style="margin: 24px 0; padding: 16px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 8px;">
                                                <p style="margin: 0; color: #fca5a5; font-size: 14px; line-height: 1.5;">
                                                    ⚠️ <strong>Lưu ý:</strong> Link này chỉ có hiệu lực trong <strong>1 giờ</strong>.
                                                    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                                                </p>
                                            </div>

                                            <p style="margin: 24px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                                Trân trọng,<br>
                                                <strong style="color: #06b6d4;">Đội ngũ NestGame</strong>
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background: rgba(6, 24, 44, 0.9); border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
                                            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                                                © 2026 NestGame. Chơi game NES miễn phí, không cần cài đặt.
                                            </p>
                                            <p style="margin: 0; color: #475569; font-size: 12px;">
                                                Email này được gửi tự động, vui lòng không trả lời.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(username, resetLink, resetLink, resetLink);
    }

    /**
     * Send OTP email for password reset
     */
    public void sendOtpEmail(String toEmail, String username, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🔐 NestGame - Mã xác thực OTP");
            helper.setText(buildOtpEmailTemplate(username, otpCode), true);

            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email OTP");
        }
    }

    private String buildOtpEmailTemplate(String username, String otpCode) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mã OTP - NestGame</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0a0f1e 0%%, #1a1f2e 100%%); min-height: 100vh;">
                    <table role="presentation" style="width: 100%%; border-collapse: collapse; background: linear-gradient(135deg, #0a0f1e 0%%, #1a1f2e 100%%); padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <!-- Main Container -->
                                <table role="presentation" style="max-width: 600px; width: 100%%; border-collapse: collapse; background: rgba(17, 25, 40, 0.95); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);">

                                    <!-- Header with Gradient -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #06b6d4 0%%, #3b82f6 50%%, #8b5cf6 100%%); padding: 40px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">
                                                🎮 NestGame
                                            </h1>
                                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                                                Nền tảng game NES huyền thoại
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Content Body -->
                                    <tr>
                                        <td style="padding: 40px 30px; background: rgba(17, 25, 40, 0.95);">
                                            <h2 style="margin: 0 0 20px; color: #06b6d4; font-size: 24px; font-weight: 700; text-align: center;">
                                                Mã xác thực OTP 🔐
                                            </h2>

                                            <p style="margin: 0 0 16px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                                                Xin chào <strong style="color: #06b6d4;">%s</strong>,
                                            </p>

                                            <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                                                Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã OTP bên dưới để xác thực:
                                            </p>

                                            <!-- OTP Code Box -->
                                            <div style="margin: 32px 0; padding: 28px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%%, rgba(59, 130, 246, 0.15) 100%%); border: 2px solid rgba(6, 182, 212, 0.5); border-radius: 20px; text-align: center;">
                                                <p style="margin: 0 0 12px; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                                                    MÃ XÁC THỰC CỦA BẠN
                                                </p>
                                                <p style="margin: 0; color: #06b6d4; font-size: 48px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 0 30px rgba(6, 182, 212, 0.5);">
                                                    %s
                                                </p>
                                            </div>

                                            <!-- Timer Warning -->
                                            <div style="margin: 24px 0; padding: 16px 20px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0;">
                                                <p style="margin: 0; color: #fcd34d; font-size: 14px; line-height: 1.5;">
                                                    ⏱️ <strong>Thời hạn:</strong> Mã này có hiệu lực trong <strong>5 phút</strong>
                                                </p>
                                            </div>

                                            <!-- Security Warning -->
                                            <div style="margin: 24px 0; padding: 16px 20px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0;">
                                                <p style="margin: 0; color: #fca5a5; font-size: 14px; line-height: 1.5;">
                                                    🔒 <strong>Bảo mật:</strong> Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ!
                                                </p>
                                            </div>

                                            <!-- Info Box -->
                                            <div style="margin: 24px 0; padding: 16px 20px; background: rgba(6, 182, 212, 0.05); border-left: 4px solid #06b6d4; border-radius: 0 12px 12px 0;">
                                                <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                                                    💡 Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email. Tài khoản của bạn vẫn an toàn.
                                                </p>
                                            </div>

                                            <p style="margin: 32px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
                                                Trân trọng,<br>
                                                <strong style="color: #06b6d4;">Đội ngũ NestGame 🎮</strong>
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background: rgba(6, 24, 44, 0.9); border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
                                            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                                                © 2026 NestGame. Chơi game NES miễn phí, không cần cài đặt.
                                            </p>
                                            <p style="margin: 0; color: #475569; font-size: 12px;">
                                                Email này được gửi tự động, vui lòng không trả lời.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(username, otpCode);
    }
}
