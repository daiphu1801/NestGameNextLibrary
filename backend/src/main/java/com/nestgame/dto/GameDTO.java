package com.nestgame.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record GameDTO(
                Long id,
                String name,
                String fileName,
                String path,
                String category,
                Long categoryId,
                String categoryName,
                String description,
                Double rating,
                Integer year,
                String region,
                Boolean isFeatured,
                String imageUrl,
                String imageSnap,
                String imageTitle,
                String system,
                Integer playCount,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {
}
