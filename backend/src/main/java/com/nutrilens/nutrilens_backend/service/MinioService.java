package com.nutrilens.nutrilens_backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
    String uploadImage(MultipartFile file);
    String getBucketName();
}
