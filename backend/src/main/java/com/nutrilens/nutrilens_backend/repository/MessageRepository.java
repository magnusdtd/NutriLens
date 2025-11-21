package com.nutrilens.nutrilens_backend.repository;

import com.nutrilens.nutrilens_backend.common.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversation_IdOrderByTimestampAsc(UUID conversationId);
}
