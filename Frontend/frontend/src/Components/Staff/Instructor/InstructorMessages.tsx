import { type FormEvent, useEffect, useRef, useState } from "react";
import useMessages from "../../../hooks/workspaceHooks/useMessages";
import "../style.css";
import "./messages.css";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "ST";

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

// Messages with the instructor's own students (real API: /api/messages).
export default function InstructorMessages() {
  const m = useMessages();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const list = m.contacts.filter((c) => `${c.fullName} ${c.subtitle}`.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [m.thread.length, m.activeId]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || m.sending) return;
    if (await m.send(text)) setDraft("");
  }

  return (
    <div className="staff-dashboard staff-workspace-page">
      <header className="staff-page_head">
        <div>
          <div className="staff-eyebrow">DIRECT MESSAGES</div>
          <h1 className="staff-page_title">Messages</h1>
          <p className="staff-page_sub">Keep course communication clear and in one place.</p>
        </div>
      </header>
      <section className="staff-card ins-chat">
        <div className="ins-chat_list">
          <input
            className="staff-input"
            placeholder="Search students"
            aria-label="Search students"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {m.loading ? (
            <p className="staff-empty">Loading…</p>
          ) : m.contacts.length === 0 ? (
            <p className="staff-empty">{m.error ?? "No students are enrolled in your batches yet."}</p>
          ) : (
            <ul className="ins-contacts">
              {list.map((c) => (
                <li key={c.userId}>
                  <button
                    type="button"
                    className={`ins-contact${c.userId === m.active?.userId ? " is-active" : ""}`}
                    onClick={() => m.select(c.userId)}
                  >
                    <span className="ins-contact_avatar">{initials(c.fullName)}</span>
                    <span className="ins-contact_text">
                      <strong>{c.fullName}</strong>
                      <small>{c.lastMessage ?? c.subtitle}</small>
                    </span>
                    {c.unreadCount > 0 && <span className="ins-contact_badge">{c.unreadCount}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ins-chat_pane">
          {!m.active ? (
            <div className="ins-chat_body">
              <div className="staff-workspace-empty">
                <span className="material-symbols-outlined">forum</span>
                <strong>No conversation selected</strong>
                <p>Choose a student from the list to read and reply to their messages.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="ins-chat_head">
                <strong>{m.active.fullName}</strong>
                <small>{m.active.subtitle}</small>
              </div>
              <div className="ins-chat_thread">
                {!m.threadLoading && m.thread.length === 0 && <p className="staff-empty">No messages yet.</p>}
                {m.thread.map((msg) => (
                  <div key={msg.messageId} className={`ins-msg${msg.isMine ? " is-me" : ""}`}>
                    <p>{msg.body}</p>
                    <small>{fmt(msg.sentAt)}</small>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              {m.error && <p className="staff-empty" role="alert">{m.error}</p>}
              <form className="ins-comment-box" onSubmit={send}>
                <input
                  className="staff-input"
                  placeholder="Write a message…"
                  aria-label="Write a message"
                  maxLength={2000}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit" className="ins-send" disabled={!draft.trim() || m.sending} aria-label="Send">
                  <span className="material-symbols-outlined icon-dir">send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
