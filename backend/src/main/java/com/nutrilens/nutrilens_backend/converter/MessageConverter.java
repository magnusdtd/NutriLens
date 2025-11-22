package com.nutrilens.nutrilens_backend.converter;

import com.nutrilens.nutrilens_backend.common.dto.chat.MessageDTO;
import com.nutrilens.nutrilens_backend.common.entity.Message;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component( "messageConverter")
public class MessageConverter extends SuperConverter<MessageDTO, Message> {
    @Autowired
    private ModelMapper modelMapper;


    @Override
    public MessageDTO convertToDTO(Message entity) {
        MessageDTO dto = modelMapper.map(entity, MessageDTO.class);
        dto.setImageUrl(entity.getImage() != null ?
                "/api/v1/images/" + entity.getImage().getFileName() : null) ;
        return dto;
    }

    @Override
    public Message convertToEntity(MessageDTO dto) {
        return modelMapper.map(dto, Message.class);
    }
}
