import { useState, type FormEvent } from "react";
import { sendNotification } from "../../../../apis/notificationApi";
import { getErrorMessage } from "../../../../apis/academyApi";
import { ROLES } from "../../../../utils/roles";
import "./send-notification.css";

type Target = "role" | "user";
const TYPES = ["Info", "Success", "Warning", "Alert"] as const;
const ROLE_OPTIONS = [ROLES.learner, ROLES.instructor, ROLES.coordinator, ROLES.manager, ROLES.contentManager, ROLES.admin];

// /admin/notifications (Admin / Manager): send a bell notification to one user or to everybody holding a role.
// The API (POST /api/notifications) validates and enforces the rules; this page only collects the input.
function SendNotificationContainer() {
  const [target, setTarget] = useState<Target>("role");
  const [role, setRole] = useState<string>(ROLES.learner);
  const [userId, setUserId] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("Info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setDone(null);
    if (!title.trim() || !message.trim()) return setError("Write the title and the message first.");
    const id = Number(userId);
    if (target === "user" && (!Number.isInteger(id) || id <= 0)) return setError("Enter a valid user ID.");

    setError("");
    setSending(true);
    try {
      const result = await sendNotification({
        ...(target === "user" ? { userId: id } : { role }),
        title: title.trim(),
        message: message.trim(),
        type,
      });
      setDone(result.recipients);
      setTitle("");
      setMessage("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not send the notification."));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="send-notification">
      <header>
        <h1>Send notification</h1>
        <p>Shows up in the bell of the people you pick.</p>
      </header>

      <form className="send-notification_form" onSubmit={submit}>
        <label>
          <span>Send to</span>
          <select value={target} onChange={(e) => setTarget(e.target.value as Target)}>
            <option value="role">Everyone with a role</option>
            <option value="user">One user</option>
          </select>
        </label>

        {target === "role" ? (
          <label>
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r} data-no-translate>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            <span>User ID</span>
            <input type="number" min={1} value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>
        )}

        <label>
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Title</span>
          <input type="text" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          <span>Message</span>
          <textarea rows={4} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>

        {error && <p className="send-notification_error" role="alert">{error}</p>}
        {done !== null && (
          <p className="send-notification_ok" role="status" data-no-translate>
            ✓ {done}
          </p>
        )}

        <button type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </section>
  );
}

export default SendNotificationContainer;
