package com.nutrilens.nutrilens_backend.controller;

import com.nutrilens.nutrilens_backend.common.dto.chat.ChatRequestDTO;
import com.nutrilens.nutrilens_backend.common.dto.chat.ChatResponseDTO;
import com.nutrilens.nutrilens_backend.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatResponseDTO> handleChatMessage(
            @RequestParam(value = "userId", required = false) UUID userId,
            @RequestParam(value = "conversationId", required = false) UUID conversationId,
            @RequestParam(value = "message") String message,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        ChatResponseDTO response = chatService.processChat(userId, conversationId, message, image);
        return ResponseEntity.ok(response);
    }
}
