package com.nutrilens.nutrilens_backend.service.impl;

import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatRequest;
import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatResponse;
import com.nutrilens.nutrilens_backend.common.dto.chat.ChatRequestDTO;
import com.nutrilens.nutrilens_backend.common.dto.chat.ChatResponseDTO;
import com.nutrilens.nutrilens_backend.common.entity.Conversation;
import com.nutrilens.nutrilens_backend.common.entity.Message;
import com.nutrilens.nutrilens_backend.common.entity.User;
import com.nutrilens.nutrilens_backend.repository.ConversationRepository;
import com.nutrilens.nutrilens_backend.repository.MessageRepository;
import com.nutrilens.nutrilens_backend.repository.UserRepository;
import com.nutrilens.nutrilens_backend.service.AiGatewayService;
import com.nutrilens.nutrilens_backend.service.ChatService;
import com.nutrilens.nutrilens_backend.service.ChatTitleService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor // Sử dụng @RequiredArgsConstructor cho clean code, tự tạo constructor
public class ChatServiceImpl implements ChatService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ChatTitleService chatTitleService;
    private final AiGatewayService aiGatewayService;

    @Override
    @Transactional
    public ChatResponseDTO getChatReply(ChatRequestDTO requestDTO) {
        Conversation conversation = findOrCreateConversation(requestDTO);

        User user = conversation.getUser();

        String reply;

        // ======================== PHẦN GỌI AI THẬT (ĐÃ COMMENT) ========================
        /*
        List<Message> previousMessages = messageRepository.findByConversation_IdOrderByTimestampAsc(conversation.getId());

        List<AiChatRequest.PreviousMessage> history = previousMessages.stream()
                .map(msg -> new AiChatRequest.PreviousMessage(msg.getRole(), msg.getContent()))
                .collect(Collectors.toList());

        AiChatRequest aiRequest = new AiChatRequest(
            user != null ? user.getId() : null, // Gửi userId nếu có
            requestDTO.getMessage(),
            history
        );

        log.info("Sending request to AI Gateway for conversationId: {}", conversation.getId());
        AiChatResponse aiResponse = aiGatewayService.getChatReplyFromAgent(aiRequest);
        reply = aiResponse.getReply();
        */
        // ==============================================================================


        // ======================= PHẦN MOCK DATA (ĐANG HOẠT ĐỘNG) =======================
        reply = generateMockReply(requestDTO.getMessage());

        saveMessage(conversation, "user", requestDTO.getMessage());
        saveMessage(conversation, "assistant", reply);
        log.info("Saved messages for conversationId: {}", conversation.getId());


        // Bước 6: Trả về response cho Frontend.
        return new ChatResponseDTO(conversation.getId(), reply, conversation.getChatName());
    }


    private Conversation findOrCreateConversation(ChatRequestDTO requestDTO) {
        if (requestDTO.getConversationId() != null) {
            log.info("Continuing conversation with id: {}", requestDTO.getConversationId());
            return conversationRepository.findById(requestDTO.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found: " + requestDTO.getConversationId()));
        }

        log.info("Starting a new conversation.");
        Conversation.ConversationBuilder newConversationBuilder = Conversation.builder()
                .chatName("New Chat");

        if (requestDTO.getUserId() != null) {
            User user = userRepository.findById(requestDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found: " + requestDTO.getUserId()));
            newConversationBuilder.user(user);
            log.info("New conversation for logged-in user: {}", requestDTO.getUserId());
        } else {
            log.info("New conversation for an anonymous user.");
        }

        return conversationRepository.save(newConversationBuilder.build());
    }

    private void saveMessage(Conversation conversation, String role, String content) {
        Message message = Message.builder()
                .conversation(conversation)
                .role(role)
                .content(content)
                .build();
        messageRepository.save(message);
    }

    private String generateMockReply(String userMessage) {
        String[] mockReplies = {
                "This is a mock response for your message: '" + userMessage + "'. The AI system is currently offline.",
                "I'm a mock assistant. Based on your request, I suggest eating more vegetables!",
                "Did you know that mock data can be very helpful for development? Here is some nutritional advice: balance your macros.",
                "Thank you for your question about '" + userMessage + "'. Here is a sample meal plan: Breakfast - Oats, Lunch - Chicken Salad, Dinner - Fish with veggies."
        };
        int randomIndex = ThreadLocalRandom.current().nextInt(mockReplies.length);
        return mockReplies[randomIndex];
    }
}