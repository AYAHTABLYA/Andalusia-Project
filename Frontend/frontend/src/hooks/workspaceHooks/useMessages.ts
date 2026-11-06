import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../../apis/academyApi";
import { getMessageContacts, getMessageThread, sendDirectMessage } from "../../apis/messagesApi";
import type { ChatMessage, MessageContact } from "../../Types/Messages";

const CONTACTS_REFRESH_MS = 20_000;
const THREAD_REFRESH_MS = 10_000;

// Shared by the student workspace and the instructor dashboard: the contact list, the open
// conversation and sending. New messages arrive by polling (no websocket on the backend).
function useMessages() {
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef<number | null>(null);

  const loadContacts = useCallback(async () => {
    try {
      setContacts(await getMessageContacts());
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Could not load your conversations."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContacts();
    const t = setInterval(() => void loadContacts(), CONTACTS_REFRESH_MS);
    return () => clearInterval(t);
  }, [loadContacts]);

  // Open the first conversation by default.
  useEffect(() => {
    if (activeId === null && contacts.length > 0) setActiveId(contacts[0].userId);
  }, [contacts, activeId]);

  const loadThread = useCallback(async (id: number, silent: boolean) => {
    if (!silent) setThreadLoading(true);
    try {
      const rows = await getMessageThread(id);
      if (activeRef.current !== id) return; // the user already switched to another conversation
      setThread(rows);
      // Opening a thread marks it as read on the server.
      setContacts((prev) => prev.map((c) => (c.userId === id ? { ...c, unreadCount: 0 } : c)));
    } catch (e) {
      if (!silent && activeRef.current === id) setError(getErrorMessage(e, "Could not load this conversation."));
    } finally {
      if (!silent && activeRef.current === id) setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    activeRef.current = activeId;
    setThread([]);
    if (activeId === null) return;
    void loadThread(activeId, false);
    const t = setInterval(() => void loadThread(activeId, true), THREAD_REFRESH_MS);
    return () => clearInterval(t);
  }, [activeId, loadThread]);

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      if (activeId === null || !text.trim()) return false;
      setSending(true);
      setError(null);
      try {
        const sent = await sendDirectMessage(activeId, text.trim());
        if (activeRef.current === activeId) setThread((prev) => [...prev, sent]);
        setContacts((prev) =>
          prev.map((c) => (c.userId === activeId ? { ...c, lastMessage: sent.body, lastMessageAt: sent.sentAt } : c)),
        );
        return true;
      } catch (e) {
        setError(getErrorMessage(e, "Could not send your message."));
        return false;
      } finally {
        setSending(false);
      }
    },
    [activeId],
  );

  const active = contacts.find((c) => c.userId === activeId) ?? null;

  return { contacts, active, activeId, select: setActiveId, thread, loading, threadLoading, sending, error, send, reload: loadContacts };
}

export default useMessages;
