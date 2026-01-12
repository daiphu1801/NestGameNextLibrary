package com.nestgame.controller;

import com.nestgame.dto.UserDTO;
import com.nestgame.entity.User;
import com.nestgame.service.CloudinaryService;
import com.nestgame.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

/**
 * Controller for user profile management (avatar, bio)
 */
@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    /**
     * Upload user avatar
     */
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Principal principal) {

        User user = extractUser(principal);

        try {
            String avatarUrl = cloudinaryService.uploadAvatar(file, user.getId());
            userService.updateAvatarUrl(user.getId(), avatarUrl);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "avatarUrl", avatarUrl,
                    "message", "Avatar uploaded successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to upload avatar"));
        }
    }

    /**
     * Delete user avatar
     */
    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar(Principal principal) {
        User user = extractUser(principal);

        cloudinaryService.deleteAvatar(user.getId());
        userService.updateAvatarUrl(user.getId(), null);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Avatar deleted successfully"));
    }

    /**
     * Update user bio
     */
    @PutMapping("/bio")
    public ResponseEntity<?> updateBio(
            @RequestBody Map<String, String> request,
            Principal principal) {

        User user = extractUser(principal);
        String bio = request.get("bio");

        // Limit bio length
        if (bio != null && bio.length() > 500) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Bio must be less than 500 characters"));
        }

        userService.updateBio(user.getId(), bio);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bio updated successfully"));
    }

    /**
     * Get current user profile
     */
    @GetMapping
    public ResponseEntity<UserDTO> getProfile(Principal principal) {
        User user = extractUser(principal);
        return ResponseEntity.ok(userService.getUserDTO(user));
    }

    private User extractUser(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Vui lòng đăng nhập");
        }
        if (principal instanceof UsernamePasswordAuthenticationToken authToken) {
            Object userObj = authToken.getPrincipal();
            if (userObj instanceof User user) {
                return user;
            }
        }
        throw new RuntimeException("Invalid authentication");
    }
}
