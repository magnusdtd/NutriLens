package com.nutrilens.nutrilens_backend.common.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDetailDto {
    private UUID id;

    private String email;

    private String username;

    private String name;

    private Integer age;

    private String gender;

    private Double height; // cm

    private Double weight; // kg

    private String goals;

    private String specialDiet;
}

