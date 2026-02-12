package com.nestgame.service;

import com.nestgame.dto.*;
import com.nestgame.dto.request.AdminCategoryRequest;
import com.nestgame.dto.request.AdminGameRequest;
import com.nestgame.dto.response.AuthResponse;
import com.nestgame.entity.Category;
import com.nestgame.entity.*;
import com.nestgame.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

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
                user.getAvatarUrl(), user.getBio(), user.getRole());

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
    }

    @Transactional
    public void updateUserStatus(Long userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setActive(isActive);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Updated status for user {} to active={}", userId, isActive);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Không tìm thấy người dùng");
        }
        userRepository.deleteById(userId);
        log.info("Deleted user {}", userId);
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
        return toGameDTO(game);
    }

    @Transactional
    public void deleteGame(Long gameId) {
        if (!gameRepository.existsById(gameId)) {
            throw new RuntimeException("Không tìm thấy game");
        }
        gameRepository.deleteById(gameId);
        log.info("Deleted game {}", gameId);
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
        return new CategoryDTO(cat.getId(), cat.getName(), cat.getDisplayName(), cat.getIcon());
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Không tìm thấy danh mục");
        }
        categoryRepository.deleteById(categoryId);
        log.info("Deleted category {}", categoryId);
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
}
