package com.nestgame.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminCategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    @NotBlank(message = "Tên hiển thị không được để trống")
    private String displayName;

    private String icon;
}
