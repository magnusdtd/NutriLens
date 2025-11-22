package com.nutrilens.nutrilens_backend.service;

import com.nutrilens.nutrilens_backend.common.entity.Conversation;

public interface ChatTitleService {
    void generateTitleAsync(Conversation conversation, String userMessage);
}
