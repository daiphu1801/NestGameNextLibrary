package com.nestgame.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nestgame.dto.*;
import com.nestgame.dto.request.AdminCategoryRequest;
import com.nestgame.dto.request.AdminGameRequest;
import com.nestgame.dto.response.AuthResponse;
import com.nestgame.entity.Category;
import com.nestgame.entity.*;
import com.nestgame.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final CategoryRepository categoryRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final GameCommentRepository gameCommentRepository;
    private final GameRatingRepository gameRatingRepository;
    private final AdminActivityLogRepository adminActivityLogRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    // ==================== AUTH ====================

    public AuthResponse adminLogin(String login, String password) {
        // Find user by either email or username first (same pattern as AuthService)
        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Tài khoản không có quyền admin");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(), // always use username for auth
                        password));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        com.nestgame.dto.UserDTO userDTO = new com.nestgame.dto.UserDTO(
                user.getId(), user.getEmail(), user.getUsername(),
                user.getAvatarUrl(), user.getBio(), user.getRole(), user.getKeybindingConfig());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userDTO)
                .build();
    }

    // ==================== DASHBOARD ====================

    @Transactional(readOnly = true)
    public AdminDashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalGames = gameRepository.count();
        long totalCategories = categoryRepository.count();
        long totalPlays = playHistoryRepository.count();

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
        long activeUsers = userRepository.countByIsActiveTrue();

        // Top 5 games by play count
        List<GameDTO> topGames = gameRepository.findTop5ByOrderByPlayCountDesc()
                .stream()
                .map(this::toGameDTO)
                .collect(Collectors.toList());

        // Recent 10 users
        List<AdminUserDTO> recentUsers = userRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toAdminUserDTO)
                .collect(Collectors.toList());

        return AdminDashboardStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalGames(totalGames)
                .totalCategories(totalCategories)
                .totalPlays(totalPlays)
                .newUsersThisMonth(newUsersThisMonth)
                .activeUsers(activeUsers)
                .topGames(topGames)
                .recentUsers(recentUsers)
                .build();
    }

    // ==================== USERS ====================

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getUsers(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageable).map(this::toAdminUserDTO);
        }
        return userRepository.findAll(pageable).map(this::toAdminUserDTO);
    }

    @Transactional
    public void updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Updated role for user {} to {}", userId, role);
        logActivity("system", "UPDATE", "USER", user.getUsername(), "Đổi role thành " + role);
    }

    @Transactional
    public void updateUserStatus(Long userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setActive(isActive);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Updated status for user {} to active={}", userId, isActive);
        logActivity("system", "UPDATE", "USER", user.getUsername(), isActive ? "Kích hoạt" : "Vô hiệu hóa");
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Không tìm thấy người dùng");
        }
        userRepository.deleteById(userId);
        log.info("Deleted user {}", userId);
        logActivity("system", "DELETE", "USER", "ID: " + userId, "Xóa user ID: " + userId);
    }

    // ==================== GAMES ====================

    @Transactional(readOnly = true)
    public Page<GameDTO> getGames(String search, String category, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return gameRepository.findByNameContainingIgnoreCase(search, pageable)
                    .map(this::toGameDTO);
        }
        if (category != null && !category.trim().isEmpty()) {
            return gameRepository.findByCategoryName(category, pageable)
                    .map(this::toGameDTO);
        }
        return gameRepository.findAll(pageable).map(this::toGameDTO);
    }

    @Transactional(readOnly = true)
    public Page<GameDTO> getFeaturedGames(Pageable pageable) {
        return gameRepository.findByIsFeaturedTrue(pageable).map(this::toGameDTO);
    }

    @Transactional
    public GameDTO createGame(AdminGameRequest request) {
        Category cat = null;
        if (request.getCategoryId() != null) {
            cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        }

        Game game = Game.builder()
                .name(request.getName())
                .fileName(request.getFileName())
                .path(request.getPath())
                .category(cat)
                .description(request.getDescription())
                .rating(request.getRating())
                .year(request.getYear())
                .region(request.getRegion())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .imageUrl(request.getImageUrl())
                .imageSnap(request.getImageSnap())
                .imageTitle(request.getImageTitle())
                .build();

        game = gameRepository.save(game);
        log.info("Created game: {}", game.getName());
        logActivity("system", "CREATE", "GAME", game.getName(), "Tạo game mới: " + game.getName());
        return toGameDTO(game);
    }

    @Transactional
    public GameDTO updateGame(Long gameId, AdminGameRequest request) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy game"));

        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            game.setCategory(cat);
        }

        game.setName(request.getName());
        game.setFileName(request.getFileName());
        game.setPath(request.getPath());
        game.setDescription(request.getDescription());
        game.setRating(request.getRating());
        game.setYear(request.getYear());
        game.setRegion(request.getRegion());
        game.setIsFeatured(request.getIsFeatured());
        game.setImageUrl(request.getImageUrl());
        game.setImageSnap(request.getImageSnap());
        game.setImageTitle(request.getImageTitle());

        game = gameRepository.save(game);
        log.info("Updated game: {}", game.getName());
        logActivity("system", "UPDATE", "GAME", game.getName(), "Cập nhật game: " + game.getName());
        return toGameDTO(game);
    }

    @Transactional
    public void deleteGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy game"));

        // 1. Xóa play_history, comments, ratings liên quan
        playHistoryRepository.deleteByGameId(gameId);
        gameCommentRepository.deleteByGameId(gameId);
        gameRatingRepository.deleteByGameId(gameId);

        // 2. Xóa favorites (ManyToMany trong User) — cần load users có game này
        List<User> usersWithFavorite = userRepository.findAll().stream()
                .filter(u -> u.getFavorites() != null && u.getFavorites().stream()
                        .anyMatch(g -> g.getId().equals(gameId)))
                .collect(Collectors.toList());
        for (User u : usersWithFavorite) {
            u.getFavorites().removeIf(g -> g.getId().equals(gameId));
            userRepository.save(u);
        }

        // 3. Xóa game
        gameRepository.delete(game);
        log.info("Deleted game {} with all related data", gameId);
        logActivity("system", "DELETE", "GAME", game.getName(), "Xóa game: " + game.getName());
    }

    // ==================== CATEGORIES ====================

    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryDTO(cat.getId(), cat.getName(), cat.getDisplayName(), cat.getIcon()))
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDTO createCategory(AdminCategoryRequest request) {
        Category cat = Category.builder()
                .name(request.getName())
                .displayName(request.getDisplayName())
                .icon(request.getIcon())
                .build();
        cat = categoryRepository.save(cat);
        log.info("Created category: {}", cat.getName());
        logActivity("system", "CREATE", "CATEGORY", cat.getDisplayName(), "Tạo danh mục: " + cat.getDisplayName());
        return new CategoryDTO(cat.getId(), cat.getName(), cat.getDisplayName(), cat.getIcon());
    }

    @Transactional
    public CategoryDTO updateCategory(Long categoryId, AdminCategoryRequest request) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        cat.setName(request.getName());
        cat.setDisplayName(request.getDisplayName());
        cat.setIcon(request.getIcon());
        cat = categoryRepository.save(cat);
        log.info("Updated category: {}", cat.getName());
        logActivity("system", "UPDATE", "CATEGORY", cat.getDisplayName(), "Cập nhật danh mục: " + cat.getDisplayName());
        return new CategoryDTO(cat.getId(), cat.getName(), cat.getDisplayName(), cat.getIcon());
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Không tìm thấy danh mục");
        }
        categoryRepository.deleteById(categoryId);
        log.info("Deleted category {}", categoryId);
        logActivity("system", "DELETE", "CATEGORY", "ID: " + categoryId, "Xóa danh mục ID: " + categoryId);
    }

    // ==================== FEATURED TOGGLE ====================

    @Transactional
    public GameDTO toggleFeatured(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy game"));
        game.setIsFeatured(game.getIsFeatured() == null ? true : !game.getIsFeatured());
        game = gameRepository.save(game);
        log.info("Toggled featured for game {} to {}", gameId, game.getIsFeatured());
        return toGameDTO(game);
    }

    // ==================== USER DETAIL ====================

    @Transactional(readOnly = true)
    public AdminUserDetailDTO getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        long totalPlays = playHistoryRepository.countByUser(user);
        long totalComments = gameCommentRepository.countByUserId(userId);
        int totalFavorites = user.getFavorites() != null ? user.getFavorites().size() : 0;

        List<AdminUserDetailDTO.PlayHistoryItem> recentPlays = playHistoryRepository
                .findTop10ByUserIdOrderByPlayedAtDesc(userId)
                .stream()
                .map(ph -> AdminUserDetailDTO.PlayHistoryItem.builder()
                        .gameId(ph.getGame().getId())
                        .gameName(ph.getGame().getName())
                        .gameImageUrl(ph.getGame().getImageUrl())
                        .playedAt(ph.getPlayedAt())
                        .durationSeconds(ph.getDurationSeconds())
                        .build())
                .collect(Collectors.toList());

        return AdminUserDetailDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .totalPlays(totalPlays)
                .totalComments(totalComments)
                .totalFavorites(totalFavorites)
                .recentPlays(recentPlays)
                .build();
    }

    // ==================== COMMENTS ====================

    @Transactional(readOnly = true)
    public Page<AdminCommentDTO> getComments(String search, Pageable pageable) {
        Page<GameComment> page;
        if (search != null && !search.trim().isEmpty()) {
            page = gameCommentRepository.searchComments(search, pageable);
        } else {
            page = gameCommentRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(this::toAdminCommentDTO);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        if (!gameCommentRepository.existsById(commentId)) {
            throw new RuntimeException("Không tìm thấy bình luận");
        }
        gameCommentRepository.deleteById(commentId);
        log.info("Deleted comment {}", commentId);
        logActivity("system", "DELETE", "COMMENT", "ID: " + commentId, "Xóa bình luận ID: " + commentId);
    }

    // ==================== MAPPERS ====================

    private AdminUserDTO toAdminUserDTO(User user) {
        return AdminUserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private GameDTO toGameDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .name(game.getName())
                .fileName(game.getFileName())
                .path(game.getPath())
                .categoryId(game.getCategory() != null ? game.getCategory().getId() : null)
                .categoryName(game.getCategory() != null ? game.getCategory().getDisplayName() : null)
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

    private AdminCommentDTO toAdminCommentDTO(GameComment comment) {
        return AdminCommentDTO.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .avatarUrl(comment.getUser().getAvatarUrl())
                .gameId(comment.getGame().getId())
                .gameName(comment.getGame().getName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    // Inner DTO for categories
    public record CategoryDTO(Long id, String name, String displayName, String icon) {
    }

    // ==================== ACTIVITY LOG ====================

    public void logActivity(String adminUsername, String action, String targetType, String targetName, String details) {
        try {
            AdminActivityLog logEntry = AdminActivityLog.builder()
                    .adminUsername(adminUsername)
                    .action(action)
                    .targetType(targetType)
                    .targetName(targetName)
                    .details(details)
                    .build();
            adminActivityLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Failed to log activity: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<AdminActivityLog> getActivityLogs(String targetType, Pageable pageable) {
        if (targetType != null && !targetType.trim().isEmpty()) {
            return adminActivityLogRepository.findByTargetTypeOrderByCreatedAtDesc(targetType, pageable);
        }
        return adminActivityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    // ==================== ADMIN SETTINGS ====================

    @Transactional(readOnly = true)
    public AdminUserDTO getAdminProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));
        return toAdminUserDTO(user);
    }

    @Transactional
    public AdminUserDTO updateAdminProfile(String currentUsername, Map<String, String> updates) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));
        if (updates.containsKey("username"))
            user.setUsername(updates.get("username"));
        if (updates.containsKey("email"))
            user.setEmail(updates.get("email"));
        if (updates.containsKey("bio"))
            user.setBio(updates.get("bio"));
        if (updates.containsKey("avatarUrl"))
            user.setAvatarUrl(updates.get("avatarUrl"));
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        logActivity(currentUsername, "UPDATE", "SETTINGS", user.getUsername(), "Cập nhật profile");
        return toAdminUserDTO(user);
    }

    @Transactional
    public void changeAdminPassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logActivity(username, "UPDATE", "SETTINGS", user.getUsername(), "Đổi mật khẩu");
    }

    // ==================== NOTIFICATIONS ====================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotifications() {
        List<Map<String, Object>> notifications = new ArrayList<>();

        // Recent users (last 5)
        userRepository.findTop10ByOrderByCreatedAtDesc().stream().limit(5).forEach(user -> {
            Map<String, Object> n = new LinkedHashMap<>();
            n.put("type", "NEW_USER");
            n.put("message", "Người dùng mới: " + user.getUsername());
            n.put("timestamp", user.getCreatedAt());
            notifications.add(n);
        });

        // Recent activity logs (last 5)
        adminActivityLogRepository.findTop20ByOrderByCreatedAtDesc().stream().limit(5).forEach(logEntry -> {
            Map<String, Object> n = new LinkedHashMap<>();
            n.put("type", "ACTIVITY");
            n.put("message", logEntry.getDetails());
            n.put("timestamp", logEntry.getCreatedAt());
            notifications.add(n);
        });

        // Sort by timestamp desc
        notifications
                .sort((a, b) -> ((LocalDateTime) b.get("timestamp")).compareTo((LocalDateTime) a.get("timestamp")));
        return notifications.stream().limit(10).collect(Collectors.toList());
    }

    // ==================== RATINGS (ADMIN) ====================

    @Transactional(readOnly = true)
    public Page<Map<String, Object>> getRatings(String search, Pageable pageable) {
        Page<GameRating> page;
        if (search != null && !search.trim().isEmpty()) {
            page = gameRatingRepository.searchRatings(search, pageable);
        } else {
            page = gameRatingRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(r -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r.getId());
            map.put("userId", r.getUser().getId());
            map.put("username", r.getUser().getUsername());
            map.put("avatarUrl", r.getUser().getAvatarUrl());
            map.put("gameId", r.getGame().getId());
            map.put("gameName", r.getGame().getName());
            map.put("rating", r.getRating());
            map.put("createdAt", r.getCreatedAt());
            return map;
        });
    }

    @Transactional
    public void deleteRating(Long ratingId) {
        if (!gameRatingRepository.existsById(ratingId)) {
            throw new RuntimeException("Không tìm thấy đánh giá");
        }
        gameRatingRepository.deleteById(ratingId);
        log.info("Deleted rating {}", ratingId);
        logActivity("system", "DELETE", "RATING", "ID: " + ratingId, "Xóa đánh giá ID: " + ratingId);
    }

    // ==================== RESEED FROM JSON ====================

    /**
     * Read games.json from classpath and insert only games whose fileName is not
     * already present in the database. Returns a summary map.
     */
    @Transactional
    public Map<String, Object> reseedFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("games.json");
            InputStream inputStream = resource.getInputStream();
            List<JsonGame> jsonGames = objectMapper.readValue(inputStream, new TypeReference<List<JsonGame>>() {});
            log.info("[Reseed] Read {} games from games.json", jsonGames.size());

            // Collect all existing fileNames in one query
            Set<String> existingFileNames = gameRepository.findAll()
                    .stream()
                    .map(Game::getFileName)
                    .collect(Collectors.toSet());

            // Pre-load / create categories
            Map<String, Category> categoryMap = new HashMap<>();
            for (Category cat : categoryRepository.findAll()) {
                categoryMap.put(cat.getName().toLowerCase(), cat);
            }

            int added = 0, skipped = 0;
            for (JsonGame jg : jsonGames) {
                String fileName = jg.getFileName();
                if (fileName == null || existingFileNames.contains(fileName)) {
                    skipped++;
                    continue;
                }

                // Ensure category exists
                String catKey = jg.getCategory() == null ? "other" : jg.getCategory().toLowerCase();
                if (!categoryMap.containsKey(catKey)) {
                    Category newCat = new Category();
                    newCat.setName(catKey);
                    newCat.setDisplayName(catKey.substring(0, 1).toUpperCase() + catKey.substring(1));
                    newCat = categoryRepository.save(newCat);
                    categoryMap.put(catKey, newCat);
                }

                Game game = Game.builder()
                        .name(jg.getName())
                        .fileName(fileName)
                        .path(jg.getPath() != null ? jg.getPath() : fileName)
                        .category(categoryMap.get(catKey))
                        .description(jg.getDescription())
                        .rating(jg.getRating())
                        .year(jg.getYear())
                        .region(jg.getRegion())
                        .isFeatured(Boolean.TRUE.equals(jg.getIsFeatured()))
                        .imageUrl(jg.getImage())
                        .imageSnap(jg.getImageSnap())
                        .imageTitle(jg.getImageTitle())
                        .build();

                gameRepository.save(game);
                existingFileNames.add(fileName);
                added++;
            }

            log.info("[Reseed] Done — added: {}, skipped (already exist): {}", added, skipped);
            logActivity("system", "RESEED", "GAME", "games.json",
                    String.format("Reseed: +%d mới, %d bỏ qua", added, skipped));

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("total", jsonGames.size());
            result.put("added", added);
            result.put("skipped", skipped);
            return result;

        } catch (Exception e) {
            log.error("[Reseed] Failed: ", e);
            throw new RuntimeException("Reseed thất bại: " + e.getMessage());
        }
    }
}
