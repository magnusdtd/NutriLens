package com.nutrilens.nutrilens_backend.common.dto.user;


import lombok.Data;

@Data
public class UserProfileRequestDTO {
    private String username;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private Integer calorieGoal;
    private String specialDiet;
    private String cuisine;
}
