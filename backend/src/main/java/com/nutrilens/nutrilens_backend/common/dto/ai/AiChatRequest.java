package com.nutrilens.nutrilens_backend.common.dto.ai;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AiChatRequest {
    private UUID userId;
    private String userMessage;
    private List<PreviousMessage> history;

    @Getter
    @AllArgsConstructor
    public static class PreviousMessage {
        private String role;
        private String content;
    }
}
