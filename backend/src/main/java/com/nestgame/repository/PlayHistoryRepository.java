package com.nestgame.repository;

import com.nestgame.entity.Game;
import com.nestgame.entity.PlayHistory;
import com.nestgame.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
    Optional<PlayHistory> findByUserAndGame(User user, Game game);

    List<PlayHistory> findByUserOrderByPlayedAtDesc(User user);

    Optional<PlayHistory> findTopByUserOrderByPlayedAtAsc(User user);

    long countByUser(User user);
}
