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

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
  hint?: string;
};

// Password input with a show / hide toggle.
function PasswordField({ id, label, value, onChange, autoComplete, minLength, hint }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="portal-ui_field">
      <label htmlFor={id}>{label}</label>
      <div className="profile_pw-wrap">
        <input id={id} className="portal-ui_input" type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} required value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="profile_pw-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((v) => !v)}>
          <span className="material-symbols-outlined">{visible ? "visibility_off" : "visibility"}</span>
        </button>
      </div>
      {hint && <span className="portal-ui_hint">{hint}</span>}
    </div>
  );
}

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
        <PasswordField id="currentPassword" label="Current Password" autoComplete="current-password" value={currentPassword} onChange={setCurrentPassword} />
        <PasswordField id="newPassword" label="New Password" autoComplete="new-password" minLength={8} value={newPassword} onChange={setNewPassword} hint="At least 8 characters, with an uppercase letter and a number." />
        <PasswordField id="confirmPassword" label="Confirm New Password" autoComplete="new-password" minLength={8} value={confirm} onChange={setConfirm} />

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
