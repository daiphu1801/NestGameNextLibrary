package com.nestgame.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCommentDTO {
    private Long id;
    private Long userId;
    private String username;
    private String avatarUrl;
    private Long gameId;
    private String gameName;
    private String content;
    private LocalDateTime createdAt;
}
