package com.nutrilens.nutrilens_backend.service.impl;

import com.nutrilens.nutrilens_backend.common.dto.auth.AuthenticationResponse;
import com.nutrilens.nutrilens_backend.common.dto.auth.LoginRequest;
import com.nutrilens.nutrilens_backend.common.dto.auth.RegisterRequest;
import com.nutrilens.nutrilens_backend.common.entity.User;
import com.nutrilens.nutrilens_backend.repository.UserRepository;
import com.nutrilens.nutrilens_backend.service.AuthenticationService;
import com.nutrilens.nutrilens_backend.service.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;


    public AuthenticationServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public AuthenticationResponse registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username is already taken!");
        }
        User user = new User();

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());

        userRepository.save(user);

        return AuthenticationResponse
                .builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .token(jwtService.generateToken(user.getUsername()))
                .build();
    }

    @Override
    public AuthenticationResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        String token = jwtService.generateToken(user.getUsername());

        return AuthenticationResponse
                .builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .token(token)
                .build();
    }

}
