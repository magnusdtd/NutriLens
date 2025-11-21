package com.nutrilens.nutrilens_backend.common.dto.user;


import lombok.Data;

@Data
public class UserProfileRequestDTO {
    private String name;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String goals;
    private  String specialDiet;
}
