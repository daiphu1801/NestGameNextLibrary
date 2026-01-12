package com.nestgame.repository;

import com.nestgame.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    /**
     * Find the most recent unverified OTP for an email
     */
    Optional<PasswordResetOtp> findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);

    /**
     * Find verified OTP for password reset
     */
    Optional<PasswordResetOtp> findFirstByEmailAndVerifiedTrueOrderByCreatedAtDesc(String email);

    /**
     * Delete all OTPs for a specific email
     */
    @Modifying
    @Query("DELETE FROM PasswordResetOtp p WHERE p.email = :email")
    void deleteByEmail(@Param("email") String email);

    /**
     * Delete expired OTPs
     */
    @Modifying
    @Query("DELETE FROM PasswordResetOtp p WHERE p.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);
}
