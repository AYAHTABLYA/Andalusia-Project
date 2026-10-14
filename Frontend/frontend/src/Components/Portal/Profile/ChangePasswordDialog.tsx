import { useState } from "react";
import type { FormEvent } from "react";
import Dialog from "../Shared/Dialog";
import type { ChangePasswordValues } from "../../../Types/Profile";
import "../Shared/style.css";
import "./style.css";

type Props = {
  onClose: () => void;
  onSubmit: (values: ChangePasswordValues) => Promise<void>;
};

function ChangePasswordDialog({ onClose, onSubmit }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({ currentPassword, newPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the password.");
      setSaving(false);
    }
  };

  return (
    <Dialog icon="lock_reset" title="Change Password" onClose={onClose}>
      <form className="profile_form" onSubmit={handleSubmit}>
        <div className="portal-ui_field">
          <label htmlFor="currentPassword">Current Password</label>
          <input id="currentPassword" className="portal-ui_input" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="portal-ui_field">
          <label htmlFor="newPassword">New Password</label>
          <input id="newPassword" className="portal-ui_input" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <span className="portal-ui_hint">At least 8 characters, with an uppercase letter and a number.</span>
        </div>
        <div className="portal-ui_field">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" className="portal-ui_input" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>

        {error && (
          <div className="profile_form-note" role="alert">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="profile_form-actions">
          <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="portal-ui_btn portal-ui_btn--primary" disabled={saving}>
            {saving ? "Saving..." : "Update Password"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export default ChangePasswordDialog;
