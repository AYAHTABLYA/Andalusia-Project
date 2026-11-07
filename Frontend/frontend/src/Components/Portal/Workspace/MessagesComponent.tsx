import { memo, type FormEvent, type RefObject } from "react";
import { Link } from "react-router-dom";
import type { ChatMessage, MessageContact } from "../../../Types/Messages";
import EmptyState from "./EmptyState";
import { fmtRelative, initials } from "./helpers";

type Props = {
  loading: boolean;
  error: string | null;
  contacts: MessageContact[];
  hasContacts: boolean;
  active: MessageContact | null;
  thread: ChatMessage[];
  threadLoading: boolean;
  sending: boolean;
  search: string;
  draft: string;
  endRef: RefObject<HTMLDivElement | null>;
  onSearch: (value: string) => void;
  onSelect: (userId: number) => void;
  onDraftChange: (value: string) => void;
  onSend: (e: FormEvent) => void;
  onRetry: () => void;
};

function MessagesComponent({
  loading, error, contacts, hasContacts, active, thread, threadLoading, sending,
  search, draft, endRef, onSearch, onSelect, onDraftChange, onSend, onRetry,
}: Props) {
  return (
    <>
      <header className="ws_head">
        <span className="portal-eyebrow">DIRECT MESSAGES</span>
        <h1>Messages</h1>
        <p>Message your instructors about your courses.</p>
      </header>

      <div className="portal-card ws_chat">
        <div className="ws_chat-list">
          <label className="portal-search">
            <span className="material-symbols-outlined">search</span>
            <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search instructors" aria-label="Search instructors" />
          </label>
          <ul>
            {contacts.map((c) => (
              <li key={c.userId}>
                <button className={`ws_conv${c.userId === active?.userId ? " is-active" : ""}`} onClick={() => onSelect(c.userId)}>
                  <span className="ws_avatar">{initials(c.fullName)}</span>
                  <span className="ws_conv-text">
                    <strong>{c.fullName}</strong>
                    <small>{c.lastMessage ?? c.subtitle}</small>
                  </span>
                  {c.unreadCount > 0 && <span className="ws_badge">{c.unreadCount}</span>}
                </button>
              </li>
            ))}
            {!loading && hasContacts && contacts.length === 0 && <li className="ws_muted ws_pad">No instructors found.</li>}
          </ul>
        </div>

        <div className="ws_chat-pane">
          {loading ? (
            <p className="ws_pad">Loading…</p>
          ) : !hasContacts ? (
            <>
              <div className="ws_chat-empty">
                <EmptyState
                  icon="forum"
                  title={error ? "Could not load your conversations" : "No instructors to message yet"}
                  text={
                    error ??
                    "You can message an instructor as soon as you are enrolled in a batch that has one assigned. Check My courses to see your batch and instructor."
                  }
                />
                <div className="ws_actions ws_actions--center">
                  {error ? (
                    <button type="button" className="portal-btn portal-btn-secondary" onClick={onRetry}>Retry</button>
                  ) : (
                    <Link to="/workspace/courses" className="portal-btn portal-btn-secondary">Go to My courses</Link>
                  )}
                </div>
              </div>
              <form className="ws_chat-compose is-disabled" onSubmit={(e) => e.preventDefault()}>
                <input disabled placeholder="No instructor selected" aria-label="Write a message" />
                <button type="button" className="portal-btn portal-btn-primary ws_send" disabled aria-label="Send message">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </>
          ) : !active ? (
            <EmptyState icon="forum" title="Select an instructor" text="Choose a conversation from the list." />
          ) : (
            <>
              <header className="ws_chat-head">
                <span className="ws_avatar">{initials(active.fullName)}</span>
                <div>
                  <strong>{active.fullName}</strong>
                  <small>{active.subtitle || "Instructor"}</small>
                </div>
              </header>
              <div className="ws_chat-body">
                {threadLoading && thread.length === 0 && <p className="ws_muted">Loading…</p>}
                {!threadLoading && thread.length === 0 && (
                  <p className="ws_muted">No messages yet. Say hello to {active.fullName.split(" ")[0]}.</p>
                )}
                {thread.map((m) => (
                  <div key={m.messageId} className={`ws_msg${m.isMine ? " is-me" : ""}`}>
                    <p>{m.body}</p>
                    <small>{fmtRelative(m.sentAt)}</small>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              {error && <p className="ws_feedback" role="alert">{error}</p>}
              <form className="ws_chat-compose" onSubmit={onSend}>
                <input
                  value={draft}
                  maxLength={2000}
                  onChange={(e) => onDraftChange(e.target.value)}
                  placeholder="Write a message..."
                  aria-label="Write a message"
                />
                <button className="portal-btn portal-btn-primary ws_send" disabled={!draft.trim() || sending} aria-label="Send message">
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
