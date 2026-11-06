import { apiGet, apiPost } from "./academyApi";
import type { ChatMessage, MessageContact } from "../Types/Messages";

// The API sends UTC timestamps. If one arrives without a zone ("2026-10-31T14:35:00"), the browser would read it
// as local time and show it hours off, so a missing zone is treated as UTC.
const asUtc = (iso: string): string => (/(Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : `${iso}Z`);

const toMessage = (m: ChatMessage): ChatMessage => ({
  ...m,
  sentAt: asUtc(m.sentAt),
  readAt: m.readAt ? asUtc(m.readAt) : undefined,
});

// People the signed-in user may message (a learner's instructors / an instructor's learners).
export const getMessageContacts = async (signal?: AbortSignal) =>
  (await apiGet<MessageContact[]>("/api/messages/contacts", undefined, signal)).map((c) => ({
    ...c,
    lastMessageAt: c.lastMessageAt ? asUtc(c.lastMessageAt) : undefined,
  }));

// The whole thread with one contact (the server marks their messages as read).
export const getMessageThread = async (userId: number, signal?: AbortSignal) =>
  (await apiGet<ChatMessage[]>(`/api/messages/with/${userId}`, undefined, signal)).map(toMessage);

export const sendDirectMessage = async (recipientId: number, body: string) =>
  toMessage(await apiPost<ChatMessage>("/api/messages", { recipientId, body }));

// Number of unread messages (drives the badge on the student sidebar).
export const getUnreadMessageCount = async (signal?: AbortSignal) =>
  (await apiGet<{ count: number }>("/api/messages/unread-count", undefined, signal)).count ?? 0;
