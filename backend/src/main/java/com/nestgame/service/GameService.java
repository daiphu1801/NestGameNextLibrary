package com.nestgame.service;

import com.nestgame.dto.GameDTO;
import com.nestgame.entity.Game;
import com.nestgame.repository.GameRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {
    private final GameRepository gameRepository;

    public Page<GameDTO> getGames(String search, String category, String region, Pageable pageable) {
        Specification<Game> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), searchLike));
            }

            if (StringUtils.hasText(category) && !"all".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category").get("name"), category));
            }

            if (StringUtils.hasText(region) && !"all".equalsIgnoreCase(region)) {
                predicates.add(cb.equal(root.get("region"), region));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return gameRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    public GameDTO getGameById(Long id) {
        return gameRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Game not found"));
    }

    private GameDTO mapToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .name(game.getName())
                .fileName(game.getFileName())
                .path(game.getPath())
                .categoryId(game.getCategory() != null ? game.getCategory().getId() : null)
                .categoryName(game.getCategory() != null ? game.getCategory().getName() : null)
                .category(game.getCategory() != null ? game.getCategory().getName() : null)
                .description(game.getDescription())
                .rating(game.getRating())
                .year(game.getYear())
                .region(game.getRegion())
                .isFeatured(game.getIsFeatured())
                .imageUrl(game.getImageUrl())
                .imageSnap(game.getImageSnap())
                .imageTitle(game.getImageTitle())
                .playCount(game.getPlayCount())
                .createdAt(game.getCreatedAt())
                .updatedAt(game.getUpdatedAt())
                .build();
    }
}
