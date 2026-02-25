package com.nestgame.repository;

import com.nestgame.entity.Game;
import com.nestgame.entity.SaveState;
import com.nestgame.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SaveStateRepository extends JpaRepository<SaveState, Long> {

    Optional<SaveState> findByUserAndGameAndSlot(User user, Game game, Integer slot);

    List<SaveState> findByUserAndGameOrderBySlotAsc(User user, Game game);

    void deleteByUserAndGameAndSlot(User user, Game game, Integer slot);
}
