package com.nestgame.repository;

import com.nestgame.entity.GameRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRatingRepository extends JpaRepository<GameRating, Long> {

    Optional<GameRating> findByUserIdAndGameId(Long userId, Long gameId);

    List<GameRating> findByGameId(Long gameId);

    List<GameRating> findByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM GameRating r WHERE r.game.id = :gameId")
    Double getAverageRatingByGameId(Long gameId);

    @Query("SELECT COUNT(r) FROM GameRating r WHERE r.game.id = :gameId")
    Long countByGameId(Long gameId);

    void deleteByUserIdAndGameId(Long userId, Long gameId);
}
