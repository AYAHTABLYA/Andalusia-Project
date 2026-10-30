import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import "./style.css";

type ApplyFormValues = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

type Props = {
  title: string;
  description?: string;
  // guest-form: name + email required | message-only: logged-in course apply
  // confirm: one-click confirm (program apply) | login-required: no token available
  mode: "guest-form" | "message-only" | "confirm" | "login-required";
  status: "idle" | "submitting" | "success" | "error";
  errorText?: string;
  successText?: string;
  // Pre-filled values (e.g. the signed-in user's name / email) and whether the phone is mandatory.
  initialValues?: Partial<ApplyFormValues>;
  phoneRequired?: boolean;
  onSubmit: (values: ApplyFormValues) => void;
  onClose: () => void;
};

function ApplyDialog({ title, description, mode, status, errorText, successText, initialValues, phoneRequired, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<ApplyFormValues>({
    fullName: initialValues?.fullName ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    message: initialValues?.message ?? "",
  });

  const submitting = status === "submitting";

  function setField(name: keyof ApplyFormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!submitting) onSubmit(values);
  }

  return (
    <div className="apply-dialog_overlay" onClick={onClose}>
      <div
        className="apply-dialog_box-1"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="apply-dialog_head">
          <h3 className="apply-dialog_title">{title}</h3>
          <button type="button" className="apply-dialog_close" aria-label="Close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {status === "success" ? (
          <div className="apply-dialog_body">
            <p className="apply-dialog_success">{successText ?? "Application submitted."}</p>
            <button type="button" className="apply-dialog_btn-1" onClick={onClose}>Done</button>
          </div>
        ) : mode === "login-required" ? (
          <div className="apply-dialog_body">
            <p className="apply-dialog_text">
              You need to sign in before you can apply. Your application is linked to your account.
            </p>
            <Link to="/login" className="apply-dialog_btn-1 apply-dialog_btn-link">Sign in to continue</Link>
          </div>
        ) : (
          <form className="apply-dialog_body" onSubmit={handleSubmit}>
            {description && <p className="apply-dialog_text">{description}</p>}

            {mode === "guest-form" && (
              <>
                <label className="apply-dialog_label">
                  Full name *
                  <input
                    className="apply-dialog_input"
                    value={values.fullName}
                    maxLength={120}
                    required
                    onChange={(e) => setField("fullName", e.target.value)}
                  />
                </label>
                <label className="apply-dialog_label">
                  Email *
                  <input
                    className="apply-dialog_input"
                    type="email"
                    value={values.email}
                    maxLength={200}
                    required
                    onChange={(e) => setField("email", e.target.value)}
                  />
                </label>
                <label className="apply-dialog_label">
                  {phoneRequired ? "Phone / WhatsApp *" : "Phone"}
                  <input
                    className="apply-dialog_input"
                    type="tel"
                    value={values.phone}
                    maxLength={phoneRequired ? 20 : 30}
                    required={phoneRequired}
                    placeholder="+20 100 123 4567"
                    onChange={(e) => setField("phone", e.target.value)}
                  />
                </label>
              </>
            )}

            {(mode === "guest-form" || mode === "message-only") && (
              <label className="apply-dialog_label">
                Message (optional)
                <textarea
                  className="apply-dialog_input apply-dialog_textarea"
                  value={values.message}
                  maxLength={2000}
                  rows={3}
                  onChange={(e) => setField("message", e.target.value)}
                />
              </label>
            )}

            {status === "error" && errorText && (
              <p className="apply-dialog_error" role="alert">{errorText}</p>
            )}

            <button type="submit" className="apply-dialog_btn-1" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ApplyDialog;
export type { ApplyFormValues };
