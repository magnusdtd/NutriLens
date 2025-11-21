package com.nutrilens.nutrilens_backend.common.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class ChatResponseDTO {
    private UUID conversationId;
    private String reply;
    private String chatName;
}
