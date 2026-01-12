package com.nestgame.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nestgame.dto.JsonGame;
import com.nestgame.entity.Category;
import com.nestgame.entity.Game;
import com.nestgame.repository.CategoryRepository;
import com.nestgame.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final GameRepository gameRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (gameRepository.count() > 0) {
            log.info("Database already contains data. Skipping initialization.");
            return;
        }

        log.info("Starting data initialization from games.json...");

        try {
            ClassPathResource resource = new ClassPathResource("games.json");
            InputStream inputStream = resource.getInputStream();
            List<JsonGame> jsonGames = objectMapper.readValue(inputStream, new TypeReference<List<JsonGame>>() {
            });

            log.info("Read {} games from JSON file.", jsonGames.size());

            Map<String, Category> categoryMap = new HashMap<>();

            // 1. Process Categories first
            for (JsonGame jsonGame : jsonGames) {
                String categoryName = jsonGame.getCategory();
                if (categoryName == null || categoryName.trim().isEmpty()) {
                    categoryName = "other";
                }
                categoryName = categoryName.toLowerCase();

                if (!categoryMap.containsKey(categoryName)) {
                    // Check DB first to avoid duplicates if partial data exists
                    Optional<Category> existing = categoryRepository.findByName(categoryName);
                    if (existing.isPresent()) {
                        categoryMap.put(categoryName, existing.get());
                    } else {
                        Category newCategory = new Category();
                        newCategory.setName(categoryName);
                        newCategory.setDisplayName(capitalize(categoryName)); // Fixed typo
                        categoryMap.put(categoryName, categoryRepository.save(newCategory)); // Save immediately to get
                                                                                             // ID
                    }
                }
            }
            log.info("Processed {} categories.", categoryMap.size());

            // 2. Process Games
            for (JsonGame jsonGame : jsonGames) {
                Game game = new Game();
                game.setName(jsonGame.getName());
                game.setFileName(jsonGame.getFileName()); // Set fileName from JSON
                game.setPath(jsonGame.getPath()); // Assuming path is filename or relative path
                game.setDescription(jsonGame.getDescription());
                game.setRating(jsonGame.getRating());
                game.setYear(jsonGame.getYear()); // Fixed: setReleaseYear -> setYear
                game.setRegion(jsonGame.getRegion()); // Set region from JSON
                game.setImageUrl(jsonGame.getImage());
                game.setImageSnap(jsonGame.getImageSnap()); // Set imageSnap from JSON
                game.setImageTitle(jsonGame.getImageTitle()); // Set imageTitle from JSON
                game.setIsFeatured(Boolean.TRUE.equals(jsonGame.getIsFeatured())); // Fixed: setFeatured ->
                                                                                   // setIsFeatured

                // Set Category
                String catKey = jsonGame.getCategory() == null ? "other" : jsonGame.getCategory().toLowerCase();
                game.setCategory(categoryMap.get(catKey));

                gameRepository.save(game);
            }

            log.info("Successfully imported {} games into the database.", jsonGames.size());

        } catch (Exception e) {
            log.error("Failed to import data: ", e);
        }
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty())
            return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
