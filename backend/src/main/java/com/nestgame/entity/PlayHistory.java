package com.nestgame.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "play_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "played_at")
    @Builder.Default
    private LocalDateTime playedAt = LocalDateTime.now();

    @Column(name = "duration_seconds")
    @Builder.Default
    private Integer durationSeconds = 0;
}
