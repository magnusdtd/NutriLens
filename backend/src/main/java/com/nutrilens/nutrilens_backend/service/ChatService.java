package com.nutrilens.nutrilens_backend.service;

import com.nutrilens.nutrilens_backend.common.dto.chat.ChatRequestDTO;
import com.nutrilens.nutrilens_backend.common.dto.chat.ChatResponseDTO;

import java.util.UUID;

public interface ChatService {
    ChatResponseDTO getChatReply(ChatRequestDTO requestDTO);
}
