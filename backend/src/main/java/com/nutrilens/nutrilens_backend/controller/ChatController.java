package com.nutrilens.nutrilens_backend.controller;

import com.nutrilens.nutrilens_backend.common.dto.chat.ChatRequestDTO;
import com.nutrilens.nutrilens_backend.common.dto.chat.ChatResponseDTO;
import com.nutrilens.nutrilens_backend.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("")
    public ResponseEntity<ChatResponseDTO> handleChatMessage(@RequestBody ChatRequestDTO requestDTO) {
        ChatResponseDTO response = chatService.getChatReply(requestDTO);
        return ResponseEntity.ok(response);
    }
}
