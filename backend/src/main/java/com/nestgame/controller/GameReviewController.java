package com.nestgame.controller;

import com.nestgame.dto.GameRatingDTO;
import com.nestgame.dto.GameCommentDTO;
import com.nestgame.entity.Game;
import com.nestgame.entity.GameComment;
import com.nestgame.entity.GameRating;
import com.nestgame.entity.User;
import com.nestgame.repository.GameCommentRepository;
import com.nestgame.repository.GameRatingRepository;
import com.nestgame.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for game ratings and comments
 */
@RestController
@RequestMapping("/games/{gameId}")
@RequiredArgsConstructor
public class GameReviewController {

    private final GameRatingRepository ratingRepository;
    private final GameCommentRepository commentRepository;
    private final GameRepository gameRepository;

    // =================== RATINGS ===================

    /**
     * Get all ratings for a game
     */
    @GetMapping("/ratings")
    public ResponseEntity<?> getRatings(@PathVariable Long gameId) {
        Double avgRating = ratingRepository.getAverageRatingByGameId(gameId);
        Long count = ratingRepository.countByGameId(gameId);

        return ResponseEntity.ok(Map.of(
                "averageRating", avgRating != null ? Math.round(avgRating * 10) / 10.0 : 0,
                "totalRatings", count));
    }

    /**
     * Get user's rating for a game
     */
    @GetMapping("/ratings/me")
    public ResponseEntity<?> getMyRating(@PathVariable Long gameId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(Map.of("rating", 0));
        }

        User user = extractUser(principal);
        return ratingRepository.findByUserIdAndGameId(user.getId(), gameId)
                .map(r -> ResponseEntity.ok(Map.of("rating", r.getRating())))
                .orElse(ResponseEntity.ok(Map.of("rating", 0)));
    }

    /**
     * Rate a game (1-5 stars)
     */
    @PostMapping("/ratings")
    public ResponseEntity<?> rateGame(
            @PathVariable Long gameId,
            @RequestBody Map<String, Integer> request,
            Principal principal) {

        User user = extractUser(principal);
        Integer rating = request.get("rating");

        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Rating must be between 1 and 5"));
        }

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        // Update or create rating
        GameRating gameRating = ratingRepository.findByUserIdAndGameId(user.getId(), gameId)
                .orElse(GameRating.builder()
                        .user(user)
                        .game(game)
                        .build());

        gameRating.setRating(rating);
        gameRating.setUpdatedAt(LocalDateTime.now());
        // Get new average
        Double avgRating = ratingRepository.getAverageRatingByGameId(gameId);

        // Update rating in Game entity for Leaderboard sorting
        game.setRating(avgRating != null ? Math.round(avgRating * 10) / 10.0 : rating.doubleValue());
        gameRepository.save(game);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "rating", rating,
                "averageRating", avgRating != null ? Math.round(avgRating * 10) / 10.0 : rating));
    }

    // =================== COMMENTS ===================

    /**
     * Get all comments for a game
     */
    @GetMapping("/comments")
    public ResponseEntity<List<GameCommentDTO>> getComments(@PathVariable Long gameId) {
        List<GameComment> comments = commentRepository.findByGameIdOrderByCreatedAtDesc(gameId);

        List<GameCommentDTO> dtos = comments.stream()
                .map(this::toCommentDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * Add a comment to a game
     */
    @PostMapping("/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long gameId,
            @RequestBody Map<String, String> request,
            Principal principal) {

        User user = extractUser(principal);
        String content = request.get("content");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Comment content is required"));
        }

        if (content.length() > 1000) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Comment must be less than 1000 characters"));
        }

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        GameComment comment = GameComment.builder()
                .user(user)
                .game(game)
                .content(content.trim())
                .build();

        comment = commentRepository.save(comment);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "comment", toCommentDTO(comment)));
    }

    /**
     * Delete a comment (only by owner)
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long gameId,
            @PathVariable Long commentId,
            Principal principal) {

        User user = extractUser(principal);

        GameComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "You can only delete your own comments"));
        }

        commentRepository.delete(comment);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Comment deleted"));
    }

    // =================== HELPERS ===================

    private GameCommentDTO toCommentDTO(GameComment comment) {
        return GameCommentDTO.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .avatarUrl(comment.getUser().getAvatarUrl())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
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
