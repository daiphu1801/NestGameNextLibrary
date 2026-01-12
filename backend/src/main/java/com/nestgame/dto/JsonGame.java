package com.nestgame.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JsonGame {
    private Long id;
    private String name;
    private String fileName;
    private String path;
    private String category;
    private String description;
    private Double rating;
    private Integer year;
    private Boolean isFeatured;
    private String region;
    private String image;
    private String imageSnap;
    private String imageTitle;
}
