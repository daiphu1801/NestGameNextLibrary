package com.nestgame.controller;

import com.nestgame.dto.GameDTO;
import com.nestgame.entity.User;
import com.nestgame.exception.BadRequestException;
import com.nestgame.service.PlayHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/me/history")
@RequiredArgsConstructor
@Slf4j
public class PlayHistoryController {

    private final PlayHistoryService playHistoryService;

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
    public ResponseEntity<List<GameDTO>> getUserHistory(Principal principal) {
        User user = extractUser(principal);
        List<GameDTO> history = playHistoryService.getUserHistory(user);
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> recordPlay(
            @RequestBody Map<String, Long> request,
            Principal principal) {
        User user = extractUser(principal);
        Long gameId = request.get("gameId");

        if (gameId == null) {
            throw new BadRequestException("gameId là bắt buộc");
        }

        playHistoryService.recordPlay(user, gameId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã ghi lại lịch sử chơi"));
    }
}
