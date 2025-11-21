package com.nutrilens.nutrilens_backend.repository;

import com.nutrilens.nutrilens_backend.common.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    // Tìm conversation mới nhất của một user
    Optional<Conversation> findTopByUser_IdOrderByCreatedAtDesc(UUID userId);
    List<Conversation> findByUser_IdOrderByCreatedAtDesc(UUID userId);
}
