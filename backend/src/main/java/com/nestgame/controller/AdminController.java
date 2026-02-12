package com.nestgame.controller;

import com.nestgame.dto.AdminUserDTO;
import com.nestgame.dto.GameDTO;
import com.nestgame.dto.request.AdminCategoryRequest;
import com.nestgame.dto.request.AdminGameRequest;
import com.nestgame.dto.request.LoginRequest;
import com.nestgame.dto.response.AuthResponse;
import com.nestgame.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    // ==================== AUTH ====================

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(adminService.adminLogin(request.getLogin(), request.getPassword()));
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
}
