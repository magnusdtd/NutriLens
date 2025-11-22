package com.nutrilens.nutrilens_backend.service.impl;

import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatRequest;
import com.nutrilens.nutrilens_backend.common.dto.ai.AiChatResponse;
import com.nutrilens.nutrilens_backend.common.dto.chat.*;
import com.nutrilens.nutrilens_backend.common.entity.Conversation;
import com.nutrilens.nutrilens_backend.common.entity.Image;
import com.nutrilens.nutrilens_backend.common.entity.Message;
import com.nutrilens.nutrilens_backend.common.entity.User;
import com.nutrilens.nutrilens_backend.converter.ConversationConverter;
import com.nutrilens.nutrilens_backend.converter.MessageConverter;
import com.nutrilens.nutrilens_backend.repository.ConversationRepository;
import com.nutrilens.nutrilens_backend.repository.ImageRepository;
import com.nutrilens.nutrilens_backend.repository.MessageRepository;
import com.nutrilens.nutrilens_backend.repository.UserRepository;
import com.nutrilens.nutrilens_backend.service.AiGatewayService;
import com.nutrilens.nutrilens_backend.service.ChatService;
import com.nutrilens.nutrilens_backend.service.ChatTitleService;
import com.nutrilens.nutrilens_backend.service.MinioService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ChatTitleService chatTitleService;
    private final AiGatewayService aiGatewayService;
    private final MinioService minioService;
    private final ImageRepository imageRepository;
    private final ConversationConverter conversationConverter;
    private final MessageConverter messageConverter;

    @Override
    public ChatResponseDTO processChat(UUID userId, UUID conversationId, String messageContent, MultipartFile imageFile) {
        Conversation conversation = findOrCreateConversation(userId, conversationId);

        String imageIdStr = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            log.info("Processing image upload...");
            String fileName = minioService.uploadImage(imageFile);

            Image image = new Image();
            image.setUserId(conversation.getUser().getId());
            image.setBucket(minioService.getBucketName());
            image.setFileName(fileName);
            image.setUploadTime(LocalDateTime.now());

            image = imageRepository.save(image);
            imageIdStr = image.getId().toString();
            log.info("Image saved with ID: {}", imageIdStr);
        }
        List<Message> previousMessages = messageRepository.findByConversation_IdOrderByTimestampAsc(conversation.getId());

        List<AiChatRequest.PreviousMessage> history = previousMessages.stream()
                .map(msg -> new AiChatRequest.PreviousMessage(msg.getRole(), msg.getContent()))
                .toList();

        AiChatRequest aiRequest = AiChatRequest.builder()
                .userId(conversation.getUser().getId().toString())
                .message(messageContent)
                .image(imageIdStr)
                .history(history)
                .build();

        log.info("Calling AI Agent...");
        AiChatResponse aiResponse = aiGatewayService.getChatReplyFromAgent(aiRequest);
        String replyContent = aiResponse.getReply();

        Image image = null;
        if (imageFile != null && imageIdStr != null) {
            image = imageRepository.findById(UUID.fromString(imageIdStr)).orElse(null);
        }

        saveMessage(conversation, "user", messageContent, image);
        saveMessage(conversation, "assistant", replyContent, null);


        if (conversation.getChatName().equals("New Chat")) {
            chatTitleService.generateTitleAsync(conversation, messageContent);
        }

        return new ChatResponseDTO(conversation.getId(), replyContent, conversation.getChatName());

    }

    @Override
    public List<ConversationPreviewDTO> getUserConversations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Conversation> conversations = conversationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());

        return conversations.stream()
                .map(conversationConverter::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ConversationDetailDTO getConversationDetail(UUID conversationId, String email) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to access this conversation");
        }
        List<Message> messages = messageRepository.findByConversation_IdOrderByTimestampAsc(conversationId);

        List<MessageDTO> messageDTOs = messages.stream().map(messageConverter::convertToDTO).toList();
        return ConversationDetailDTO.builder()
                .id(conversation.getId())
                .chatName(conversation.getChatName())
                .messages(messageDTOs)
                .build();
    }


    private Conversation findOrCreateConversation(UUID userId, UUID conversationId) {
        if (conversationId != null) {
            return conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        }
        // New Chat
        Conversation.ConversationBuilder builder = Conversation.builder().chatName("New Chat");
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            builder.user(user);
        }
        return conversationRepository.save(builder.build());
    }


    private void saveMessage(Conversation conversation, String role, String content, Image image) {
        Message message = Message.builder()
                .conversation(conversation)
                .role(role)
                .content(content)
                .image(image)
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