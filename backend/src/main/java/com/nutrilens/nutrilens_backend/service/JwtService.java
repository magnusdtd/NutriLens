package com.nutrilens.nutrilens_backend.service;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(String email);

    Claims extractClaims(String token);

    String extractUsername(String token);

    boolean validateToken(String username, UserDetails userDetails, String token);

    boolean isTokenExpired(String token);
}
