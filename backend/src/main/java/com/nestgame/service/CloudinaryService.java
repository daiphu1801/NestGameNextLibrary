package com.nestgame.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

/**
 * Service for uploading and managing images on Cloudinary
 */
@Service
@Slf4j
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
        log.info("Cloudinary initialized with cloud name: {}", cloudName);
    }

    /**
     * Upload an avatar image to Cloudinary
     * 
     * @param file   The image file to upload
     * @param userId The user ID (used for naming the file)
     * @return The URL of the uploaded image
     */
    @SuppressWarnings("unchecked")
    public String uploadAvatar(MultipartFile file, Long userId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Validate file size (max 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 2MB");
        }

        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", "nestgame/avatars/user_" + userId,
                "overwrite", true,
                "transformation", new Transformation()
                        .width(200)
                        .height(200)
                        .crop("fill")
                        .gravity("face")));

        String url = (String) uploadResult.get("secure_url");
        log.info("Avatar uploaded for user {}: {}", userId, url);
        return url;
    }

    /**
     * Delete an avatar from Cloudinary
     * 
     * @param userId The user ID
     */
    public void deleteAvatar(Long userId) {
        try {
            cloudinary.uploader().destroy("nestgame/avatars/user_" + userId, ObjectUtils.emptyMap());
            log.info("Avatar deleted for user {}", userId);
        } catch (IOException e) {
            log.error("Failed to delete avatar for user {}: {}", userId, e.getMessage());
        }
    }
}
