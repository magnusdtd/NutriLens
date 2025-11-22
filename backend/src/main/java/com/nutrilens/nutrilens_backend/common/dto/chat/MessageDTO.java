package com.nutrilens.nutrilens_backend.common.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {
    private Long id;
    private String role; // "user" or "assistant"
    private String content;
    private String imageUrl;
    private LocalDateTime timestamp;
}