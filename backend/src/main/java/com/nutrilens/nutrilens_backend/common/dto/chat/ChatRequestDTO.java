package com.nutrilens.nutrilens_backend.common.dto.chat;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ChatRequestDTO {
    private UUID userId;
    private UUID conversationId; // Optional: null nếu là cuộc trò chuyện mới
    private String message;
}
