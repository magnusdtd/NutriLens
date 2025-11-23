package com.nutrilens.nutrilens_backend.service.impl;

import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatRequest;
import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatResponse;
import com.nutrilens.nutrilens_backend.common.entity.Conversation;
import com.nutrilens.nutrilens_backend.repository.ConversationRepository;
import com.nutrilens.nutrilens_backend.service.AiGatewayService;
import com.nutrilens.nutrilens_backend.service.ChatTitleService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class ChatTitleServiceImpl implements ChatTitleService {

    private final AiGatewayService aiGatewayService;
    private final ConversationRepository conversationRepository;
    private static final String DEFAULT_MODEL = "HCX-005";


    public ChatTitleServiceImpl(AiGatewayService aiGatewayService, ConversationRepository conversationRepository) {
        this.aiGatewayService = aiGatewayService;
        this.conversationRepository = conversationRepository;
    }

    @Async
    @Transactional
    public void generateTitleAsync(Conversation conversation, String userMessage) {
        try {
            String titlePrompt = String.format("""
                    You are a system that generates **short, simple chat titles**.
                    - Only output a concise title (maximum 3–6 words).
                    - Do NOT explain.
                    - Do NOT translate.
                    - Do NOT include punctuation like ".", "\"", or "-".
                    - Do NOT include greeting phrases.
                    - Just return the title only.
                    - Please answer in English.
                    User message: "%s"
                    """, userMessage);


            AiChatRequest titleRequest = AiChatRequest.builder()
                    .userId(conversation.getUser().getId().toString())
                    .message(titlePrompt)
                    .history(List.of())
                    .build();

            AiChatResponse titleResponse = aiGatewayService.getChatReplyFromAgent(titleRequest);
            String generatedTitle = titleResponse.getReply().replaceAll("[\"\\n\\.]", "").trim();

            if (!generatedTitle.isEmpty()) {
                generatedTitle = Character.toUpperCase(generatedTitle.charAt(0)) + generatedTitle.substring(1);
                conversation.setChatName(generatedTitle);
                conversationRepository.save(conversation);
                log.info("✅ Generated chat title: {}", generatedTitle);
            }
        } catch (Exception e) {
            log.warn("❌ Failed to generate chat title: {}", e.getMessage());
        }
    }
}
