package com.nutrilens.nutrilens_backend.common.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "images")
@Data
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    private String bucket;

    private String fileName;

    @Column(name = "upload_time")
    private LocalDateTime uploadTime;
}
