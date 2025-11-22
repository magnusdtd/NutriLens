package com.nutrilens.nutrilens_backend.converter;

import com.nutrilens.nutrilens_backend.common.dto.chat.ConversationPreviewDTO;
import com.nutrilens.nutrilens_backend.common.entity.Conversation;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("conversationConverter")
public class ConversationConverter extends SuperConverter<ConversationPreviewDTO, Conversation> {

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ConversationPreviewDTO convertToDTO(Conversation entity) {
        ConversationPreviewDTO dto = modelMapper.map(entity, ConversationPreviewDTO.class);
        dto.setLastActivity((entity.getUpdatedAt() != null ? entity.getUpdatedAt() : entity.getCreatedAt()).atStartOfDay());
        return dto;
    }

    @Override
    public Conversation convertToEntity(ConversationPreviewDTO dto) {
        return modelMapper.map(dto, Conversation.class);
    }
}
