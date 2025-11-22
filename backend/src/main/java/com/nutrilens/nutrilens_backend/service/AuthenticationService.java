package com.nutrilens.nutrilens_backend.service;

import com.nutrilens.nutrilens_backend.common.dto.auth.LoginRequest;
import com.nutrilens.nutrilens_backend.common.dto.auth.AuthenticationResponse;
import com.nutrilens.nutrilens_backend.common.dto.auth.RegisterRequest;
import jakarta.validation.Valid;

public interface AuthenticationService {

    AuthenticationResponse registerUser(@Valid RegisterRequest request);
    AuthenticationResponse login(@Valid LoginRequest request);

}
