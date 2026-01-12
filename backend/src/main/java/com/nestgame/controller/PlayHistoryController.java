package com.nestgame.controller;

import com.nestgame.dto.GameDTO;
import com.nestgame.entity.User;
import com.nestgame.service.PlayHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/me/history")
@RequiredArgsConstructor
public class PlayHistoryController {

    private final PlayHistoryService playHistoryService;

    @PostMapping
    public ResponseEntity<Map<String, String>> recordPlay(
            @RequestBody Map<String, Long> request,
            Principal connectedUser) {
        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();
        Long gameId = request.get("gameId");

        if (gameId == null) {
            throw new RuntimeException("gameId is required");
        }

        playHistoryService.recordPlay(user, gameId);
        return ResponseEntity.ok(Map.of("message", "Play history recorded successfully"));
    }

    @GetMapping
    public ResponseEntity<List<GameDTO>> getUserHistory(Principal connectedUser) {
        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();
        List<GameDTO> history = playHistoryService.getUserHistory(user);
        return ResponseEntity.ok(history);
    }
}
