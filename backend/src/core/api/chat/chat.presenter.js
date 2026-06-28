const iso = value => (value instanceof Date ? value.toISOString() : value ?? null);

export const presentMessage = m => ({
    message_id: m.id,
    conversation_id: m.conversationId,
    sender_id: m.senderId,
    content: m.content ?? null,
    voice_url: m.voiceUrl ?? null,
    created_at: iso(m.createdAt),
});

export const presentMessageCreated = m => ({
    message_id: m.id,
    conversation_id: m.conversationId,
    sender_id: m.senderId,
    created_at: iso(m.createdAt),
});

export const presentMessagesPage = (messages, nextCursor) => ({
    next_cursor: nextCursor,
    data: messages.map(m => ({
        message_id: m.id,
        content: m.content ?? null,
        voice_url: m.voiceUrl ?? null,
        sender_id: m.senderId,
        created_at: iso(m.createdAt),
    })),
});

export const presentParticipant = p => ({

    participant_id: `${p.conversationId}:${p.userId}`,
    user_id: p.userId,
    full_name: p.fullName ?? null,
    created_at: iso(p.createdAt),
});

export const presentParticipantsList = participants => ({
    total: participants.length,
    data: participants.map(presentParticipant),
});

export const presentConversationDetail = conv => ({
    conversation_id: conv.id,
    participants: (conv.participants || []).map(p => ({
        user_id: p.userId,
        full_name: p.fullName ?? null,
    })),
    created_at: iso(conv.createdAt),
});

export const presentConversationListItem = item => ({
    conversation_id: item.id,
    participants: (item.participants || []).map(p => ({
        user_id: p.userId,
        full_name: p.fullName ?? null,
    })),
    last_message: item.lastMessage
        ? {
              message_id: item.lastMessage.id,
              content: item.lastMessage.content ?? null,
              created_at: iso(item.lastMessage.createdAt),
          }
        : null,
});

export const presentConversationList = (items, total) => ({
    total,
    data: items.map(presentConversationListItem),
});
