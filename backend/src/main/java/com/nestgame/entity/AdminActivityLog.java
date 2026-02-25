package com.nestgame.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_activity_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_username", nullable = false)
    private String adminUsername;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, TOGGLE, LOGIN

    @Column(name = "target_type", nullable = false)
    private String targetType; // GAME, USER, CATEGORY, COMMENT, RATING

    @Column(name = "target_name")
    private String targetName;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
