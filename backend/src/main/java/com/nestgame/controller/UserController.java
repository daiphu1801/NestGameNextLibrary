package com.nestgame.controller;

import com.nestgame.dto.GameDTO;
import com.nestgame.entity.User;
import com.nestgame.exception.BadRequestException;
import com.nestgame.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/me/favorites")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    private User extractUser(Principal principal) {
        if (principal == null) {
            throw new BadRequestException("Người dùng chưa đăng nhập");
        }

        if (principal instanceof UsernamePasswordAuthenticationToken authToken) {
            Object userObj = authToken.getPrincipal();
            if (userObj instanceof User user) {
                return user;
            }
        }

        throw new BadRequestException("Phiên đăng nhập không hợp lệ");
    }

    @GetMapping
    public ResponseEntity<List<GameDTO>> getUserFavorites(Principal principal) {
        User user = extractUser(principal);
        List<GameDTO> favorites = userService.getUserFavorites(user);
        return ResponseEntity.ok(favorites);
    }

    @PostMapping("/{gameId}")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @PathVariable Long gameId,
            Principal principal) {
        User user = extractUser(principal);
        userService.addFavorite(user, gameId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã thêm vào danh sách yêu thích"));
    }

    @DeleteMapping("/{gameId}")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @PathVariable Long gameId,
            Principal principal) {
        User user = extractUser(principal);
        userService.removeFavorite(user, gameId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã xóa khỏi danh sách yêu thích"));
    }
}
