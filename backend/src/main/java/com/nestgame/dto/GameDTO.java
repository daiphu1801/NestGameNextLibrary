package com.nestgame.dto;

public record GameDTO(
        Long id,
        String name,
        String fileName,
        String path,
        String category,
        String description,
        Double rating,
        Integer year,
        String region,
        Boolean isFeatured,
        String imageUrl,
        String imageSnap,
        String imageTitle,
        Integer playCount) {
}
