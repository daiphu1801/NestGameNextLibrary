package com.nestgame.service;

import com.nestgame.dto.GameDTO;
import com.nestgame.entity.Game;
import com.nestgame.entity.PlayHistory;
import com.nestgame.entity.User;
import com.nestgame.exception.ResourceNotFoundException;
import com.nestgame.repository.GameRepository;
import com.nestgame.repository.PlayHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayHistoryService {

    private static final int MAX_HISTORY_SIZE = 15;

    private final PlayHistoryRepository playHistoryRepository;
    private final GameRepository gameRepository;

    @Transactional
    public void recordPlay(User user, Long gameId) {
        log.info("Recording play: userId={}, gameId={}", user.getId(), gameId);

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy game với ID: " + gameId));

        // Check if user already played this game
        Optional<PlayHistory> existingHistory = playHistoryRepository.findByUserAndGame(user, game);

        if (existingHistory.isPresent()) {
            // Update existing record
            PlayHistory history = existingHistory.get();
            history.setPlayedAt(LocalDateTime.now());
            playHistoryRepository.save(history);
            log.info("Updated play history for user '{}' and game '{}'", user.getUsername(), game.getName());
        } else {
            // Check if user has reached the limit
            long count = playHistoryRepository.countByUser(user);

            if (count >= MAX_HISTORY_SIZE) {
                // Remove oldest record
                Optional<PlayHistory> oldest = playHistoryRepository.findTopByUserOrderByPlayedAtAsc(user);
                oldest.ifPresent(playHistoryRepository::delete);
                log.info("Removed oldest play history for user '{}'", user.getUsername());
            }

            // Create new record
            PlayHistory newHistory = PlayHistory.builder()
                    .user(user)
                    .game(game)
                    .playedAt(LocalDateTime.now())
                    .build();
            playHistoryRepository.save(newHistory);
            log.info("Created new play history for user '{}' and game '{}'", user.getUsername(), game.getName());
        }
    }

    @Transactional(readOnly = true)
    public List<GameDTO> getUserHistory(User user) {
        log.info("Getting history for userId={}", user.getId());

        try {
            List<PlayHistory> history = playHistoryRepository.findByUserOrderByPlayedAtDesc(user);
            return history.stream()
                    .map(h -> convertToGameDTO(h.getGame()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting user history: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private GameDTO convertToGameDTO(Game game) {
        return new GameDTO(
                game.getId(),
                game.getName(),
                game.getFileName(),
                game.getPath(),
                game.getCategory() != null ? game.getCategory().getName() : null,
                game.getDescription(),
                game.getRating(),
                game.getYear(),
                game.getRegion(),
                game.getIsFeatured(),
                game.getImageUrl(),
                game.getImageSnap(),
                game.getImageTitle(),
                game.getPlayCount());
    }
}
