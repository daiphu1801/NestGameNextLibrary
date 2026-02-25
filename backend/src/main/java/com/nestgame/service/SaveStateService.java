package com.nestgame.service;

import com.nestgame.dto.SaveStateDTO;
import com.nestgame.entity.Game;
import com.nestgame.entity.SaveState;
import com.nestgame.entity.User;
import com.nestgame.exception.ResourceNotFoundException;
import com.nestgame.repository.GameRepository;
import com.nestgame.repository.SaveStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SaveStateService {

    private final SaveStateRepository saveStateRepository;
    private final GameRepository gameRepository;

    @Transactional
    public SaveStateDTO saveState(User user, Long gameId, int slot, byte[] stateData, byte[] thumbnail) {
        log.info("Saving state: userId={}, gameId={}, slot={}, dataSize={}bytes",
                user.getId(), gameId, slot, stateData.length);

        if (slot < 1 || slot > 3) {
            throw new IllegalArgumentException("Slot phải từ 1 đến 3");
        }

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy game với ID: " + gameId));

        Optional<SaveState> existing = saveStateRepository.findByUserAndGameAndSlot(user, game, slot);

        SaveState saveState;
        if (existing.isPresent()) {
            // Update existing save
            saveState = existing.get();
            saveState.setStateData(stateData);
            saveState.setThumbnail(thumbnail);
            saveState.setUpdatedAt(LocalDateTime.now());
            log.info("Updated existing save state for slot {}", slot);
        } else {
            // Create new save
            saveState = SaveState.builder()
                    .user(user)
                    .game(game)
                    .slot(slot)
                    .stateData(stateData)
                    .thumbnail(thumbnail)
                    .build();
            log.info("Created new save state for slot {}", slot);
        }

        saveState = saveStateRepository.save(saveState);
        return convertToDTO(saveState);
    }

    @Transactional(readOnly = true)
    public byte[] loadState(User user, Long gameId, int slot) {
        log.info("Loading state: userId={}, gameId={}, slot={}", user.getId(), gameId, slot);

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy game với ID: " + gameId));

        SaveState saveState = saveStateRepository.findByUserAndGameAndSlot(user, game, slot)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy save state cho slot " + slot));

        return saveState.getStateData();
    }

    @Transactional(readOnly = true)
    public byte[] loadThumbnail(User user, Long gameId, int slot) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy game với ID: " + gameId));

        SaveState saveState = saveStateRepository.findByUserAndGameAndSlot(user, game, slot)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy save state cho slot " + slot));

        return saveState.getThumbnail();
    }

    @Transactional(readOnly = true)
    public List<SaveStateDTO> listSlots(User user, Long gameId) {
        log.info("Listing save slots: userId={}, gameId={}", user.getId(), gameId);

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy game với ID: " + gameId));

        return saveStateRepository.findByUserAndGameOrderBySlotAsc(user, game)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteState(User user, Long gameId, int slot) {
        log.info("Deleting state: userId={}, gameId={}, slot={}", user.getId(), gameId, slot);

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy game với ID: " + gameId));

        saveStateRepository.deleteByUserAndGameAndSlot(user, game, slot);
        log.info("Deleted save state for slot {}", slot);
    }

    private SaveStateDTO convertToDTO(SaveState saveState) {
        return SaveStateDTO.builder()
                .id(saveState.getId())
                .gameId(saveState.getGame().getId())
                .gameName(saveState.getGame().getName())
                .slot(saveState.getSlot())
                .hasThumbnail(saveState.getThumbnail() != null && saveState.getThumbnail().length > 0)
                .stateSize(saveState.getStateData().length)
                .updatedAt(saveState.getUpdatedAt())
                .build();
    }
}
