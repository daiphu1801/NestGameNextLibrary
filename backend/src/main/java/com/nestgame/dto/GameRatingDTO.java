package com.nestgame.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameRatingDTO {
    private Long id;
    private Long userId;
    private Long gameId;
    private Integer rating;
    private Double averageRating;
    private Long totalRatings;
}
