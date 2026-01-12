package com.nestgame.service;

import com.nestgame.dto.GameDTO;
import com.nestgame.entity.Game;
import com.nestgame.entity.User;
import com.nestgame.exception.BadRequestException;
import com.nestgame.exception.ResourceNotFoundException;
import com.nestgame.repository.GameRepository;
import com.nestgame.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

        private final UserRepository userRepository;
        private final GameRepository gameRepository;

        @Transactional
        public void addFavorite(User user, Long gameId) {
                log.info("Adding favorite: userId={}, gameId={}", user.getId(), gameId);

                User managedUser = userRepository.findById(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy game với ID: " + gameId));

                if (managedUser.getFavorites().contains(game)) {
                        throw new BadRequestException("Game đã có trong danh sách yêu thích");
                }

                managedUser.getFavorites().add(game);
                userRepository.save(managedUser);
                log.info("Successfully added game '{}' to favorites for user '{}'", game.getName(),
                                managedUser.getUsername());
        }

        @Transactional
        public void removeFavorite(User user, Long gameId) {
                log.info("Removing favorite: userId={}, gameId={}", user.getId(), gameId);

                User managedUser = userRepository.findById(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy game với ID: " + gameId));

                if (!managedUser.getFavorites().contains(game)) {
                        throw new BadRequestException("Game không có trong danh sách yêu thích");
                }

                managedUser.getFavorites().remove(game);
                userRepository.save(managedUser);
                log.info("Successfully removed game '{}' from favorites for user '{}'", game.getName(),
                                managedUser.getUsername());
        }

        @Transactional(readOnly = true)
        public List<GameDTO> getUserFavorites(User user) {
                log.info("Getting favorites for userId={}", user.getId());

                return userRepository.findById(user.getId())
                                .map(managedUser -> managedUser.getFavorites().stream()
                                                .map(this::convertToGameDTO)
                                                .collect(Collectors.toList()))
                                .orElse(Collections.emptyList());
        }

        private GameDTO convertToGameDTO(Game game) {
                return new GameDTO(
                                game.getId(),
                                game.getName(),
                                game.getFileName(),
                                game.getPath(),
                                game.getCategory() != null ? game.getCategory().getName() : null,
                                game.getDescription(),
                                game.getRating(),
                                game.getYear(),
                                game.getRegion(),
                                game.getIsFeatured(),
                                game.getImageUrl(),
                                game.getImageSnap(),
                                game.getImageTitle(),
                                game.getPlayCount());
        }

        @Transactional
        public void updateAvatarUrl(Long userId, String avatarUrl) {
                log.info("Updating avatar for userId={}", userId);
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
                user.setAvatarUrl(avatarUrl);
                userRepository.save(user);
        }

        @Transactional
        public void updateBio(Long userId, String bio) {
                log.info("Updating bio for userId={}", userId);
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
                user.setBio(bio);
                userRepository.save(user);
        }

        public com.nestgame.dto.UserDTO getUserDTO(User user) {
                return new com.nestgame.dto.UserDTO(
                                user.getId(),
                                user.getEmail(),
                                user.getUsername(),
                                user.getAvatarUrl(),
                                user.getBio(),
                                user.getRole());
        }
}
