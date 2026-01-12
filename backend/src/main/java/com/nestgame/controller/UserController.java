package com.nestgame.controller;

import com.nestgame.dto.GameDTO;
import com.nestgame.entity.User;
import com.nestgame.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/me/favorites")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/{gameId}")
    public ResponseEntity<Map<String, String>> addFavorite(
            @PathVariable Long gameId,
            Principal connectedUser) {
        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();
        userService.addFavorite(user, gameId);
        return ResponseEntity.ok(Map.of("message", "Added to favorites successfully"));
    }

    @DeleteMapping("/{gameId}")
    public ResponseEntity<Map<String, String>> removeFavorite(
            @PathVariable Long gameId,
            Principal connectedUser) {
        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();
        userService.removeFavorite(user, gameId);
        return ResponseEntity.ok(Map.of("message", "Removed from favorites successfully"));
    }

    @GetMapping
    public ResponseEntity<List<GameDTO>> getUserFavorites(Principal connectedUser) {
        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();
        List<GameDTO> favorites = userService.getUserFavorites(user);
        return ResponseEntity.ok(favorites);
    }
}
