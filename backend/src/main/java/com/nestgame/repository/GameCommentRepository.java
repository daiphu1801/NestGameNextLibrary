package com.nestgame.repository;

import com.nestgame.entity.GameComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameCommentRepository extends JpaRepository<GameComment, Long> {

        List<GameComment> findByGameIdOrderByCreatedAtDesc(Long gameId);

        Page<GameComment> findByGameIdOrderByCreatedAtDesc(Long gameId, Pageable pageable);

        List<GameComment> findByUserId(Long userId);

        Long countByGameId(Long gameId);

        // Admin queries
        Page<GameComment> findAllByOrderByCreatedAtDesc(Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT c FROM GameComment c WHERE LOWER(c.content) LIKE LOWER(CONCAT('%', :search, '%')) "
                        +
                        "OR LOWER(c.user.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(c.game.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY c.createdAt DESC")
        Page<GameComment> searchComments(@org.springframework.data.repository.query.Param("search") String search,
                        Pageable pageable);

        long countByUserId(Long userId);

        @Modifying
        @Query("DELETE FROM GameComment c WHERE c.game.id = :gameId")
        void deleteByGameId(Long gameId);
}
