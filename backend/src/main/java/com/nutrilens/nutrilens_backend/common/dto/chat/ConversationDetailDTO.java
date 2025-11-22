package com.nutrilens.nutrilens_backend.common.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ConversationDetailDTO {
    private UUID id;
    private String chatName;
    private List<MessageDTO> messages;
}