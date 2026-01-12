package com.nestgame.repository;

import com.nestgame.entity.GameComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameCommentRepository extends JpaRepository<GameComment, Long> {

    List<GameComment> findByGameIdOrderByCreatedAtDesc(Long gameId);

    Page<GameComment> findByGameIdOrderByCreatedAtDesc(Long gameId, Pageable pageable);

    List<GameComment> findByUserId(Long userId);

    Long countByGameId(Long gameId);
}
