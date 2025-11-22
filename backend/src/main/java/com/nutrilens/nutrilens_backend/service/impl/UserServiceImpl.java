package com.nutrilens.nutrilens_backend.service.impl;

import com.nutrilens.nutrilens_backend.common.dto.user.UserDetailDto;
import com.nutrilens.nutrilens_backend.common.dto.user.UserProfileRequestDTO;
import com.nutrilens.nutrilens_backend.common.entity.User;
import com.nutrilens.nutrilens_backend.converter.UserConverter;
import com.nutrilens.nutrilens_backend.repository.UserRepository;
import com.nutrilens.nutrilens_backend.service.UserService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserConverter userConverter;

    public UserServiceImpl(UserRepository userRepository, UserConverter userConverter) {
        this.userRepository = userRepository;
        this.userConverter = userConverter;
    }

    @Override
    public UserDetailDto getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return userConverter.convertToDTO(user);
    }

    @Override
    public UserDetailDto updateUserProfile(UUID userId, UserProfileRequestDTO requestDTO) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if(requestDTO.getUsername() != null) {
            existingUser.setUsername(requestDTO.getUsername());
        }
        if(requestDTO.getAge() != null) {
            existingUser.setAge(requestDTO.getAge());
        }
        if(requestDTO.getGender() != null) {
            existingUser.setGender(requestDTO.getGender());
        }
        if(requestDTO.getHeight() != null) {
            existingUser.setHeight(requestDTO.getHeight());
        }
        if(requestDTO.getWeight() != null) {
            existingUser.setWeight(requestDTO.getWeight());
        }
        if(requestDTO.getCalorieGoal() != null) {
            existingUser.setCalorieGoal(requestDTO.getCalorieGoal());
        }
        if (requestDTO.getCuisine() != null) {
            existingUser.setCuisine(requestDTO.getCuisine());
        }
        if(requestDTO.getSpecialDiet() != null) {
            existingUser.setSpecialDiet(requestDTO.getSpecialDiet());
        }
        User updatedUser = userRepository.save(existingUser);
        return userConverter.convertToDTO(updatedUser);
    }
}
