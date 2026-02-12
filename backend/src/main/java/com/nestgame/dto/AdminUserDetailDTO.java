package com.nestgame.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDetailDTO {
    private Long id;
    private String email;
    private String username;
    private String avatarUrl;
    private String bio;
    private String role;
    private boolean isActive;
    private LocalDateTime createdAt;

    // Stats
    private long totalPlays;
    private long totalComments;
    private int totalFavorites;

    // Recent play history
    private List<PlayHistoryItem> recentPlays;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayHistoryItem {
        private Long gameId;
        private String gameName;
        private String gameImageUrl;
        private LocalDateTime playedAt;
        private Integer durationSeconds;
    }
}
