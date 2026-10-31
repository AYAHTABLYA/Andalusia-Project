import { memo, type FormEvent, type RefObject } from "react";
import type { Conversation } from "../../../Types/Workspace";
import EmptyState from "./EmptyState";
import { SUPPORT_CONVERSATION_ID } from "./constants";
import { fmtRelative, initials } from "./helpers";

type Props = {
  conversations: Conversation[];
  active: Conversation | null;
  userName: string;
  search: string;
  draft: string;
  endRef: RefObject<HTMLDivElement | null>;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
  onDraftChange: (value: string) => void;
  onSend: (e: FormEvent) => void;
};

function MessagesComponent({ conversations, active, userName, search, draft, endRef, onSearch, onSelect, onDraftChange, onSend }: Props) {
  return (
    <>
      <header className="ws_head">
        <span className="portal-eyebrow">DIRECT MESSAGES</span>
        <h1>Messages</h1>
        <p>Keep course communication clear and in one place.</p>
      </header>

      <div className="portal-card ws_chat">
        <div className="ws_chat-list">
          <label className="portal-search">
            <span className="material-symbols-outlined">search</span>
            <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search conversations" aria-label="Search conversations" />
          </label>
          <ul>
            {conversations.map((c) => (
              <li key={c.id}>
                <button className={`ws_conv${c.id === active?.id ? " is-active" : ""}`} onClick={() => onSelect(c.id)}>
                  <span className="ws_avatar">{initials(c.name)}</span>
                  <span className="ws_conv-text"><strong>{c.name}</strong><small>{c.subtitle}</small></span>
                  {c.unread > 0 && <span className="ws_badge">{c.unread}</span>}
                </button>
              </li>
            ))}
            {conversations.length === 0 && <li className="ws_muted ws_pad">No conversations found.</li>}
          </ul>
        </div>

        <div className="ws_chat-pane">
          {!active ? (
            <EmptyState icon="forum" title="No conversations" text="Your instructor conversations will appear here." />
          ) : (
            <>
              <header className="ws_chat-head">
                <span className="ws_avatar">{initials(active.name)}</span>
                <div>
                  <strong>{active.name}</strong>
                  <small>{active.id === SUPPORT_CONVERSATION_ID ? "Usually replies within a day" : "Usually replies within an hour"}</small>
                </div>
              </header>
              <div className="ws_chat-body">
                {active.messages.map((m) => (
                  <div key={m.id} className={`ws_msg${m.from === "me" ? " is-me" : ""}`}>
                    <strong>{m.from === "me" ? userName : m.author}</strong>
                    <p>{m.text}</p>
                    <small>{fmtRelative(m.at)}</small>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form className="ws_chat-compose" onSubmit={onSend}>
                <input value={draft} onChange={(e) => onDraftChange(e.target.value)} placeholder="Write a message..." aria-label="Write a message" />
                <button className="portal-btn portal-btn-primary ws_send" disabled={!draft.trim()} aria-label="Send message">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(MessagesComponent);
