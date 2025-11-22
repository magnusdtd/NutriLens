package com.nutrilens.nutrilens_backend.repository;

import com.nutrilens.nutrilens_backend.common.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
}