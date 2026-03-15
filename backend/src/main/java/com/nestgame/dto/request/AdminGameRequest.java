package com.nestgame.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminGameRequest {
    @NotBlank(message = "Tên game không được để trống")
    private String name;

    @NotBlank(message = "File name không được để trống")
    private String fileName;

    @NotBlank(message = "Đường dẫn không được để trống")
    private String path;

    private Long categoryId;
    private String description;
    private Double rating;
    private Integer year;
    private String region;
    private Boolean isFeatured;
    private String imageUrl;
    private String imageSnap;
    private String imageTitle;
    private String system;
    private Boolean isGameOfMonth;
    private String gameOfMonthPeriod;
}
