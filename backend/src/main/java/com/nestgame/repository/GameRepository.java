package com.nestgame.repository;

import com.nestgame.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long>, JpaSpecificationExecutor<Game> {
    List<Game> findByIsFeaturedTrue();

    List<Game> findByCategoryId(Long categoryId);

    List<Game> findTop10ByOrderByRatingDesc();
}
