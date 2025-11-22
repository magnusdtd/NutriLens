package com.nutrilens.nutrilens_backend.converter;

import com.nutrilens.nutrilens_backend.common.dto.UserDetailDto;

import com.nutrilens.nutrilens_backend.common.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component("userConverter")
public class UserConverter extends SuperConverter<UserDetailDto, User> {

    private final ModelMapper modelMapper;

    public UserConverter(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }


    @Override
    public UserDetailDto convertToDTO(User entity) {
        return modelMapper.map(entity, UserDetailDto.class);
    }

    @Override
    public User convertToEntity(UserDetailDto dto) {
        return modelMapper.map(dto, User.class);
    }
}
