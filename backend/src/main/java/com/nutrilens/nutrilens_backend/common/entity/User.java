package com.nutrilens.nutrilens_backend.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "\"user\"")
public class User extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "email")
    private String email;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender")
    private String gender;

    @Column(name = "height")
    private Double height; // (cm)

    @Column(name = "weight")
    private Double weight; // (kg)

    @Column(name = "calorie_goal", columnDefinition = "TEXT")
    private Integer calorieGoal;

    @Column(name = "special_diet", columnDefinition = "TEXT")
    private String specialDiet;

    @Column(name = "Cuisine")
    private String cuisine;

}
