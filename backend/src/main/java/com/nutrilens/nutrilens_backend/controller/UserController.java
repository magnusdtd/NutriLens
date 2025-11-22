package com.nutrilens.nutrilens_backend.controller;

import com.nutrilens.nutrilens_backend.common.dto.user.UserDetailDto;
import com.nutrilens.nutrilens_backend.common.dto.user.UserProfileRequestDTO;
import com.nutrilens.nutrilens_backend.service.UserService;
import com.nutrilens.nutrilens_backend.utils.SecurityUtil;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/v1/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserDetailDto getMyInfo() {
        String username = SecurityUtil.getUsername();
        return userService.getMe(username);
    }

    @PutMapping("/{userId}")
    public UserDetailDto updateUserProfile(@PathVariable UUID userId, @RequestBody UserProfileRequestDTO requestDTO) {
        return userService.updateUserProfile(userId, requestDTO);
    }
}
