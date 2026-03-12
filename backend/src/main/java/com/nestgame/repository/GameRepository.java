package com.nestgame.repository;

import com.nestgame.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface GameRepository extends JpaRepository<Game, Long>, JpaSpecificationExecutor<Game> {
    List<Game> findByIsFeaturedTrue();

    List<Game> findByCategoryId(Long categoryId);

    List<Game> findTop10ByOrderByRatingDesc();

    // Admin queries
    List<Game> findTop5ByOrderByPlayCountDesc();

    Page<Game> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Game> findByCategoryName(String categoryName, Pageable pageable);

    Page<Game> findByIsFeaturedTrue(Pageable pageable);

    Set<Game> findByFileNameIn(Set<String> fileNames);
}
