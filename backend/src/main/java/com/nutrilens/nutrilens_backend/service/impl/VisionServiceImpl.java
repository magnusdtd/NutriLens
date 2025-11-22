package com.nutrilens.nutrilens_backend.service.impl;

import com.nutrilens.nutrilens_backend.common.dto.vision.VisionAnalyzeResponseDTO;
import com.nutrilens.nutrilens_backend.service.AiGatewayService;
import com.nutrilens.nutrilens_backend.service.VisionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Slf4j
public class VisionServiceImpl implements VisionService {

    private final AiGatewayService aiGatewayService;

    public VisionServiceImpl(AiGatewayService aiGatewayService) {
        this.aiGatewayService = aiGatewayService;
    }

    @Override
    public VisionAnalyzeResponseDTO analyzeImage(MultipartFile imageFile) {
        log.info("Received image for analysis: {}", imageFile.getOriginalFilename());
//         return aiGatewayService.analyzeImage(imageFile);
        return generateMockAnalysis();
    }

    private VisionAnalyzeResponseDTO generateMockAnalysis() {
        VisionAnalyzeResponseDTO phoBo = VisionAnalyzeResponseDTO.builder()
                .predictions(List.of("phở bò", "hành lá", "thịt bò tái"))
                .nutritionalInfo(VisionAnalyzeResponseDTO.NutritionalInfo.builder()
                        .calories(450)
                        .protein(25.5)
                        .carbs(50.2)
                        .fat(15.8)
                        .build())
                .build();

        VisionAnalyzeResponseDTO comSuon = VisionAnalyzeResponseDTO.builder()
                .predictions(List.of("cơm tấm", "sườn nướng", "dưa leo", "nước mắm"))
                .nutritionalInfo(VisionAnalyzeResponseDTO.NutritionalInfo.builder()
                        .calories(650)
                        .protein(35.0)
                        .carbs(80.5)
                        .fat(22.1)
                        .build())
                .build();

        return ThreadLocalRandom.current().nextBoolean() ? phoBo : comSuon;
    }
}
