package com.nestgame.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email/Username is required")
    private String login; // can be email or username

    @NotBlank(message = "Password is required")
    private String password;
}
