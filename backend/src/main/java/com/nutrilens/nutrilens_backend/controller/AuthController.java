package com.nutrilens.nutrilens_backend.controller;

import com.nutrilens.nutrilens_backend.common.dto.AuthenticationResponse;
import com.nutrilens.nutrilens_backend.common.dto.LoginRequest;
import com.nutrilens.nutrilens_backend.common.dto.RegisterRequest;
import com.nutrilens.nutrilens_backend.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/auth")
@Validated
public class AuthController {
    private final AuthenticationService authenticationService;


    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public AuthenticationResponse registerUser(@Valid @RequestBody RegisterRequest request) {
        return authenticationService.registerUser(request);
    }

    @PostMapping("/login")
    public AuthenticationResponse login(@Valid @RequestBody LoginRequest request) {
        return authenticationService.login(request);
    }


}
