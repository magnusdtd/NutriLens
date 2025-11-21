package com.nutrilens.nutrilens_backend.service.impl;

import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatRequest;
import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatResponse;
import com.nutrilens.nutrilens_backend.common.dto.vision.VisionAnalyzeResponseDTO;
import com.nutrilens.nutrilens_backend.service.AiGatewayService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class AiGatewayServiceImpl implements AiGatewayService {

    private final WebClient webClient;

    public AiGatewayServiceImpl(WebClient.Builder webClientBuilder,
                                @Value("${ai.gateway.base.url}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    @Override
    public AiChatResponse getChatReplyFromAgent(AiChatRequest request) {
        log.info("Sending request to AI Gateway (/api/chat)");
        try {
            return webClient.post()
                    .uri("/api/chat")
                    .body(Mono.just(request), AiChatRequest.class)
                    .retrieve()
                    .bodyToMono(AiChatResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get reply from AI Gateway", e);
            throw new RuntimeException("Error communicating with the AI system.", e);
        }
    }

    @Override
    public VisionAnalyzeResponseDTO analyzeImage(MultipartFile imageFile) {
        // Tương lai: Xây dựng multipart request và gọi đến /api/predict_img của AI Gateway
        // Hiện tại: Logic này sẽ được đặt trong VisionService, đây chỉ là placeholder
        log.info("Sending image to AI Gateway (/api/predict_img)");
        throw new UnsupportedOperationException("AI Gateway call for image analysis is not implemented yet.");
    }
}
