package com.nutrilens.nutrilens_backend.service;

import com.nutrilens.nutrilens_backend.common.dto.chat.ChatResponseDTO;
import com.nutrilens.nutrilens_backend.common.dto.chat.ConversationDetailDTO;
import com.nutrilens.nutrilens_backend.common.dto.chat.ConversationPreviewDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ChatService {
    ChatResponseDTO processChat(UUID userId, UUID conversationId, String message, MultipartFile image);
    List<ConversationPreviewDTO> getUserConversations(String email);
    ConversationDetailDTO getConversationDetail(UUID conversationId, String email);
}
