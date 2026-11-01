// Direct messages learner <-> instructor (GET /api/messages/contacts, /with/{id}, POST /api/messages).
type MessageContact = {
  userId: number;
  fullName: string;
  subtitle: string; // "Course - batch" the two people share
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
};

type ChatMessage = {
  messageId: number;
  senderId: number;
  body: string;
  sentAt: string; // ISO
  isMine: boolean;
  readAt?: string;
};

export type { MessageContact, ChatMessage };
