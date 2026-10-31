import "../style.css";

// Messages (AHA design): conversation list + chat pane.
// The backend has no messaging endpoints yet, so this renders the real layout with honest empty states.
export default function InstructorMessages() {
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
          <input className="staff-input" placeholder="Search conversations" aria-label="Search conversations" disabled />
          <p className="staff-empty">No conversations yet.</p>
        </div>
        <div className="ins-chat_pane">
          <div className="ins-chat_body">
            <div className="staff-workspace-empty">
              <span className="material-symbols-outlined">forum</span>
              <strong>No conversation selected</strong>
              <p>Messages with your assigned students will appear here once the messaging API is connected.</p>
            </div>
          </div>
          <div className="ins-comment-box">
            <input className="staff-input" placeholder="Write a message…" disabled aria-label="Write a message" />
            <button type="button" className="ins-send" disabled aria-label="Send"><span className="material-symbols-outlined">send</span></button>
          </div>
        </div>
      </section>
    </div>
  );
}
