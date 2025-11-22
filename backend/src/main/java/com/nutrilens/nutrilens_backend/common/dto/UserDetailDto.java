package com.nutrilens.nutrilens_backend.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDetailDto {
    private UUID id;

    private String email;

    private String username;

    private Integer age;

    private String gender;

    private Double height; // cm

    private Double weight; // kg

    private Integer calorieGoal;

    private String specialDiet;

    private LocalDate createdAt;

    private String cuisine;

}

