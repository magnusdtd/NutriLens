package com.nutrilens.nutrilens_backend.service;


import com.nutrilens.nutrilens_backend.common.dto.user.UserDetailDto;
import com.nutrilens.nutrilens_backend.common.dto.user.UserProfileRequestDTO;

import java.util.UUID;

public interface UserService {
    UserDetailDto getMe(String email);

    UserDetailDto updateUserProfile(UUID userId, UserProfileRequestDTO requestDTO);
}
