package com.nutrilens.nutrilens_backend.common.dto.ai;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AiChatResponse {
    private String reply;
    private String chatName;
}
