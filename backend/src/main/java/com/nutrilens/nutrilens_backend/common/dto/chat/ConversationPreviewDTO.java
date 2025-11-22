package com.nutrilens.nutrilens_backend.common.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationPreviewDTO {
    private UUID id;
    private String chatName;
    private LocalDateTime lastActivity; // Lấy createdAt hoặc updatedAt
}