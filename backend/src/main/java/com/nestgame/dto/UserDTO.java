package com.nestgame.dto;

public record UserDTO(
                Long id,
                String email,
                String username,
                String avatarUrl,
                String bio,
                String role) {
}
