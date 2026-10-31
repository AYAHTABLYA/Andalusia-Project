import { type FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import MessagesComponent from "./MessagesComponent";

function MessagesContainer() {
  const { workspace, userName } = useWorkspace();
  const { conversations, markRead, sendMessage } = workspace;
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const activeId = params.get("c") ?? conversations[0]?.id ?? null;
  const active = conversations.find((c) => c.id === activeId) ?? null;
  const list = conversations.filter((c) => `${c.name} ${c.subtitle}`.toLowerCase().includes(search.toLowerCase()));

  // Opening a conversation marks it as read; new messages scroll to the bottom.
  useEffect(() => {
    if (active?.unread) markRead(active.id);
  }, [active?.id, active?.unread, markRead]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [active?.messages.length, active?.id]);

  function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!active || !text) return;
    sendMessage(active.id, text, userName);
    setDraft("");
  }

  return (
    <MessagesComponent
      conversations={list}
      active={active}
      userName={userName}
      search={search}
      draft={draft}
      endRef={endRef}
      onSearch={setSearch}
      onSelect={(id) => setParams({ c: id }, { replace: true })}
      onDraftChange={setDraft}
      onSend={send}
    />
  );
}

export default MessagesContainer;
