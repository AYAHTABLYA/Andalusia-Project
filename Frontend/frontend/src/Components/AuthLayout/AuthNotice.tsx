import type { Feedback } from "../../Types/Feedback";

const ICONS = { error: "error", success: "check_circle", info: "info" } as const;

// Inline message shown inside the auth card instead of a browser alert().
function AuthNotice({
  feedback,
  onDismiss,
}: {
  feedback: Feedback;
  onDismiss: () => void;
}) {
  if (!feedback) return null;
  return (
    <div
      className={`notice ${feedback.type}`}
      role={feedback.type === "error" ? "alert" : "status"}
    >
      <span className="material-symbols-outlined">{ICONS[feedback.type]}</span>
      <span className="notice_text">{feedback.text}</span>
      <button
        type="button"
        className="notice_close"
        aria-label="Dismiss message"
        onClick={onDismiss}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

export default AuthNotice;
