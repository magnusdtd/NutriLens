package com.nutrilens.nutrilens_backend.service;

import com.nutrilens.nutrilens_backend.common.dto.vision.VisionAnalyzeResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface VisionService {
    VisionAnalyzeResponseDTO analyzeImage(MultipartFile imageFile);
}