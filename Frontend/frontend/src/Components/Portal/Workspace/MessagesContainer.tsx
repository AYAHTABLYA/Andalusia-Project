import { type FormEvent, useEffect, useRef, useState } from "react";
import useMessages from "../../../hooks/workspaceHooks/useMessages";
import MessagesComponent from "./MessagesComponent";

// Student -> instructor messages (real API: /api/messages).
function MessagesContainer() {
  const messages = useMessages();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const list = messages.contacts.filter((c) =>
    `${c.fullName} ${c.subtitle}`.toLowerCase().includes(search.toLowerCase()),
  );

  // New messages scroll to the bottom.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.thread.length, messages.activeId]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || messages.sending) return;
    if (await messages.send(text)) setDraft("");
  }

  return (
    <MessagesComponent
      loading={messages.loading}
      error={messages.error}
      contacts={list}
      hasContacts={messages.contacts.length > 0}
      active={messages.active}
      thread={messages.thread}
      threadLoading={messages.threadLoading}
      sending={messages.sending}
      search={search}
      draft={draft}
      endRef={endRef}
      onSearch={setSearch}
      onSelect={messages.select}
      onDraftChange={setDraft}
      onSend={send}
      onRetry={messages.reload}
    />
  );
}

export default MessagesContainer;
