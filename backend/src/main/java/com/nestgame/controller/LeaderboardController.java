package com.nestgame.controller;

import com.nestgame.dto.GameDTO;
import com.nestgame.entity.Game;
import com.nestgame.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final GameRepository gameRepository;

    @GetMapping("/top-rated")
    public ResponseEntity<List<GameDTO>> getTopRatedGames() {
        List<Game> topGames = gameRepository.findTop10ByOrderByRatingDesc();

        List<GameDTO> dtos = topGames.stream()
                .map(this::toGameDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private GameDTO toGameDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .name(game.getName())
                .fileName(game.getFileName())
                .path(game.getPath())
                .categoryId(game.getCategory().getId())
                .categoryName(game.getCategory().getName())
                .description(game.getDescription())
                .rating(game.getRating())
                .year(game.getYear())
                .region(game.getRegion())
                .isFeatured(game.getIsFeatured())
                .imageUrl(game.getImageUrl())
                .imageSnap(game.getImageSnap())
                .imageTitle(game.getImageTitle())
                .playCount(game.getPlayCount())
                .createdAt(game.getCreatedAt())
                .updatedAt(game.getUpdatedAt())
                .build();
    }
}
