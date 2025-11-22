package com.nutrilens.nutrilens_backend.service.impl;

import com.nutrilens.nutrilens_backend.common.dto.vision.VisionAnalyzeResponseDTO;
import com.nutrilens.nutrilens_backend.common.entity.Image;
import com.nutrilens.nutrilens_backend.common.entity.User;
import com.nutrilens.nutrilens_backend.repository.ImageRepository;
import com.nutrilens.nutrilens_backend.repository.UserRepository;
import com.nutrilens.nutrilens_backend.service.AiGatewayService;
import com.nutrilens.nutrilens_backend.service.MinioService;
import com.nutrilens.nutrilens_backend.service.VisionService;
import com.nutrilens.nutrilens_backend.utils.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@Slf4j
public class VisionServiceImpl implements VisionService {

    private final AiGatewayService aiGatewayService;
    private final UserRepository userRepository;
    private final MinioService minioService;
    private final ImageRepository imageRepository;

    public VisionServiceImpl(AiGatewayService aiGatewayService, UserRepository userRepository, MinioService minioService, ImageRepository imageRepository) {
        this.aiGatewayService = aiGatewayService;
        this.userRepository = userRepository;
        this.minioService = minioService;
        this.imageRepository = imageRepository;
    }

    @Override
    public VisionAnalyzeResponseDTO analyzeImage(MultipartFile imageFile) {
        log.info("Starting image analysis process...");

        // 1. Lấy thông tin User hiện tại (từ Security Context)
        String username = SecurityUtil.getUsername();
        User user = userRepository.findByEmail(username) // SecurityUtil trả về email
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fileName = minioService.uploadImage(imageFile);

        Image image = new Image();
        image.setUserId(user.getId());
        image.setBucket(minioService.getBucketName());
        image.setFileName(fileName);
        image.setUploadTime(LocalDateTime.now());

        image = imageRepository.save(image);
        log.info("Image metadata saved with ID: {}", image.getId());

        return aiGatewayService.predictImage(
                user.getId().toString(),
                image.getId().toString()
        );
    }

}
