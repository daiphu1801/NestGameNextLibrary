package com.nestgame.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDTO {
    private long totalUsers;
    private long totalGames;
    private long totalCategories;
    private long totalPlays;
    private long newUsersThisMonth;
    private long activeUsers;
    private List<GameDTO> topGames;
    private List<AdminUserDTO> recentUsers;
}
