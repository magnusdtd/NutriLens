package com.nutrilens.nutrilens_backend.service;

import com.nutrilens.nutrilens_backend.common.dto.LoginRequest;
import com.nutrilens.nutrilens_backend.common.dto.AuthenticationResponse;
import com.nutrilens.nutrilens_backend.common.dto.RegisterRequest;
import jakarta.validation.Valid;

public interface AuthenticationService {

    AuthenticationResponse registerUser(@Valid RegisterRequest request);
    AuthenticationResponse login(@Valid LoginRequest request);

}
