package com.nutrilens.nutrilens_backend.common.dto.ai;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {

    @JsonProperty("user_id")
    private String userId;

    private String message;

    private String image;

    private List<PreviousMessage> history;

    @Data
    @AllArgsConstructor
    public static class PreviousMessage {
        private String role;
        private String content;
    }
}
