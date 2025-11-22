package com.nutrilens.nutrilens_backend.service;

import com.nutrilens.nutrilens_backend.common.dto.chat.ChatResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ChatService {
    ChatResponseDTO processChat(UUID userId, UUID conversationId, String message, MultipartFile image);
}
