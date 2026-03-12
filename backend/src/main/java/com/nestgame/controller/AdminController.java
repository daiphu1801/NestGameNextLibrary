package com.nestgame.controller;

import com.nestgame.dto.AdminUserDTO;
import com.nestgame.dto.GameDTO;
import com.nestgame.dto.request.AdminCategoryRequest;
import com.nestgame.dto.request.AdminGameRequest;
import com.nestgame.dto.request.LoginRequest;
import com.nestgame.dto.response.AuthResponse;
import com.nestgame.service.AdminService;
import com.nestgame.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CookieUtil cookieUtil;

    @Value("${jwt.expiration:86400000}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token.expiration:604800000}")
    private long refreshTokenExpiration;

    // ==================== AUTH ====================

    @PostMapping("/auth/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = adminService.adminLogin(request.getLogin(), request.getPassword());
        int accessMaxAge = (int) (accessTokenExpiration / 1000);
        int refreshMaxAge = (int) (refreshTokenExpiration / 1000);
        cookieUtil.setAccessTokenCookie(response, authResponse.getAccessToken(), accessMaxAge);
        cookieUtil.setRefreshTokenCookie(response, authResponse.getRefreshToken(), refreshMaxAge);
        return ResponseEntity.ok(Map.of("user", authResponse.getUser()));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> adminLogout(HttpServletResponse response) {
        cookieUtil.clearAuthCookies(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ==================== DASHBOARD ====================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==================== USERS ====================

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserDTO>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(adminService.getUsers(search, pageRequest));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        adminService.updateUserRole(id, body.get("role"));
        return ResponseEntity.ok(Map.of("message", "Cập nhật role thành công"));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        adminService.updateUserStatus(id, body.get("isActive"));
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
    }

    // ==================== GAMES ====================

    @GetMapping("/games")
    public ResponseEntity<Page<GameDTO>> getGames(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(adminService.getGames(search, category, pageRequest));
    }

    @GetMapping("/games/featured")
    public ResponseEntity<Page<GameDTO>> getFeaturedGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(adminService.getFeaturedGames(pageRequest));
    }

    @PostMapping("/games")
    public ResponseEntity<GameDTO> createGame(@Valid @RequestBody AdminGameRequest request) {
        return ResponseEntity.ok(adminService.createGame(request));
    }

    @PutMapping("/games/{id}")
    public ResponseEntity<GameDTO> updateGame(
            @PathVariable Long id,
            @Valid @RequestBody AdminGameRequest request) {
        return ResponseEntity.ok(adminService.updateGame(id, request));
    }

    @DeleteMapping("/games/{id}")
    public ResponseEntity<Map<String, String>> deleteGame(@PathVariable Long id) {
        adminService.deleteGame(id);
        return ResponseEntity.ok(Map.of("message", "Xóa game thành công"));
    }

    /**
     * POST /admin/games/reseed
     * Reads games.json from classpath and inserts only games not yet in the DB.
     * Safe to call multiple times — existing games are never touched.
     */
    @PostMapping("/games/reseed")
    public ResponseEntity<Map<String, Object>> reseedGames() {
        Map<String, Object> result = adminService.reseedFromJson();
        return ResponseEntity.ok(result);
    }

    // ==================== CATEGORIES ====================

    @GetMapping("/categories")
    public ResponseEntity<List<AdminService.CategoryDTO>> getCategories() {
        return ResponseEntity.ok(adminService.getCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<AdminService.CategoryDTO> createCategory(
            @Valid @RequestBody AdminCategoryRequest request) {
        return ResponseEntity.ok(adminService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<AdminService.CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody AdminCategoryRequest request) {
        return ResponseEntity.ok(adminService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return ResponseEntity.ok(Map.of("message", "Xóa danh mục thành công"));
    }

    // ==================== FEATURED TOGGLE ====================

    @PutMapping("/games/{id}/featured")
    public ResponseEntity<GameDTO> toggleFeatured(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleFeatured(id));
    }

    // ==================== USER DETAIL ====================

    @GetMapping("/users/{id}/detail")
    public ResponseEntity<?> getUserDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    // ==================== COMMENTS ====================

    @GetMapping("/comments")
    public ResponseEntity<Page<com.nestgame.dto.AdminCommentDTO>> getComments(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getComments(search, PageRequest.of(page, size)));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable Long id) {
        adminService.deleteComment(id);
        return ResponseEntity.ok(Map.of("message", "Xóa bình luận thành công"));
    }

    // ==================== ACTIVITY LOG ====================

    @GetMapping("/activity")
    public ResponseEntity<?> getActivityLogs(
            @RequestParam(required = false) String targetType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getActivityLogs(targetType, PageRequest.of(page, size)));
    }

    // ==================== ADMIN SETTINGS ====================

    @GetMapping("/settings/profile")
    public ResponseEntity<?> getAdminProfile(@RequestParam String username) {
        return ResponseEntity.ok(adminService.getAdminProfile(username));
    }

    @PutMapping("/settings/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody Map<String, String> body) {
        String currentUsername = body.remove("currentUsername");
        return ResponseEntity.ok(adminService.updateAdminProfile(currentUsername, body));
    }

    @PutMapping("/settings/password")
    public ResponseEntity<Map<String, String>> changeAdminPassword(@RequestBody Map<String, String> body) {
        adminService.changeAdminPassword(body.get("username"), body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    // ==================== NOTIFICATIONS ====================

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        return ResponseEntity.ok(adminService.getNotifications());
    }

    // ==================== RATINGS ====================

    @GetMapping("/ratings")
    public ResponseEntity<?> getRatings(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getRatings(search, PageRequest.of(page, size)));
    }

    @DeleteMapping("/ratings/{id}")
    public ResponseEntity<Map<String, String>> deleteRating(@PathVariable Long id) {
        adminService.deleteRating(id);
        return ResponseEntity.ok(Map.of("message", "Xóa đánh giá thành công"));
    }
}
