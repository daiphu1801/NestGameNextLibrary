package com.nestgame.controller;

import com.nestgame.dto.SaveStateDTO;
import com.nestgame.entity.User;
import com.nestgame.service.SaveStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/me/save-states")
@RequiredArgsConstructor
public class SaveStateController {

    private final SaveStateService saveStateService;

    /**
     * Upload save state (multipart: state file + optional thumbnail)
     */
    @PostMapping("/{gameId}/slot/{slot}")
    public ResponseEntity<SaveStateDTO> saveState(
            @PathVariable Long gameId,
            @PathVariable int slot,
            @RequestPart("state") MultipartFile stateFile,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnailFile,
            Principal connectedUser) throws IOException {

        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();

        byte[] stateData = stateFile.getBytes();
        byte[] thumbnail = thumbnailFile != null ? thumbnailFile.getBytes() : null;

        SaveStateDTO result = saveStateService.saveState(user, gameId, slot, stateData, thumbnail);
        return ResponseEntity.ok(result);
    }

    /**
     * Download save state as binary
     */
    @GetMapping("/{gameId}/slot/{slot}")
    public ResponseEntity<byte[]> loadState(
            @PathVariable Long gameId,
            @PathVariable int slot,
            Principal connectedUser) {

        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();

        byte[] stateData = saveStateService.loadState(user, gameId, slot);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=save_slot_" + slot + ".state")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(stateData);
    }

    /**
     * Download thumbnail for a save slot
     */
    @GetMapping("/{gameId}/slot/{slot}/thumbnail")
    public ResponseEntity<byte[]> loadThumbnail(
            @PathVariable Long gameId,
            @PathVariable int slot,
            Principal connectedUser) {

        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();

        byte[] thumbnail = saveStateService.loadThumbnail(user, gameId, slot);

        if (thumbnail == null || thumbnail.length == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(thumbnail);
    }

    /**
     * List all save slots for a game
     */
    @GetMapping("/{gameId}")
    public ResponseEntity<List<SaveStateDTO>> listSlots(
            @PathVariable Long gameId,
            Principal connectedUser) {

        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();

        List<SaveStateDTO> slots = saveStateService.listSlots(user, gameId);
        return ResponseEntity.ok(slots);
    }

    /**
     * Delete a save slot
     */
    @DeleteMapping("/{gameId}/slot/{slot}")
    public ResponseEntity<Map<String, String>> deleteState(
            @PathVariable Long gameId,
            @PathVariable int slot,
            Principal connectedUser) {

        var user = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) connectedUser)
                .getPrincipal();

        saveStateService.deleteState(user, gameId, slot);
        return ResponseEntity.ok(Map.of("message", "Save state deleted successfully"));
    }
}
