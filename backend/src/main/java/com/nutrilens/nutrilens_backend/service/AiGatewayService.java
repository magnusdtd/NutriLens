package com.nutrilens.nutrilens_backend.service;

import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatRequest;
import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatResponse;
import com.nutrilens.nutrilens_backend.common.dto.vision.VisionAnalyzeResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface AiGatewayService {
    AiChatResponse getChatReplyFromAgent(AiChatRequest request);
    VisionAnalyzeResponseDTO analyzeImage(MultipartFile imageFile);
}
