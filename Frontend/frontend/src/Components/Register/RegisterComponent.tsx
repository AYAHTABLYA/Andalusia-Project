import { memo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import type { RegisterFormValues } from "../../Types/registerFormType";

import type { SubmitStatus } from "../../Types/SubmitStatus";
import { CAMPUSES, PHONE_CODES } from "./constants";
import AuthNotice from "../AuthLayout/AuthNotice";
import type { Feedback } from "../../Types/Feedback";
import "./Style.css";
import Select from "../Shared/Select/Select";

type ChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
) => void;

function RegisterComponent({
  status,
  feedback,
  onDismissFeedback,
  verificationPending,
  verified,
  otp,
  setOtp,
  handleVerifyOtp,
  handleResendOtp,
  goToLogin,
  rules,
  canSubmit,
  formData,
  handleChange,
  handleSubmit,
}: {
  status: SubmitStatus;
  feedback: Feedback;
  onDismissFeedback: () => void;
  verificationPending: boolean;
  verified: boolean;
  otp: string;
  setOtp: (value: string) => void;
  handleVerifyOtp: (e: FormEvent) => void;
  handleResendOtp: () => void;
  goToLogin: () => void;
  rules: { label: string; ok: boolean }[];
  canSubmit: boolean;
  formData: RegisterFormValues;
  handleChange: ChangeHandler;
  handleSubmit: (e: FormEvent) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register_form_component">
      <div className="register_head">
        <h2>Create learner account</h2>
        <span lang="ar">تسجيل حساب جديد</span>
      </div>
      <p className="register_sub">
        Register to apply for executive diplomas and use student services.
      </p>

      {status === "loading" && (
        <div className="notice">
          <span className="spinner" />
          Creating your account...
        </div>
      )}
      {status === "success" && (
        <div className="notice success">
          <span className="material-symbols-outlined">check_circle</span>
          Account created successfully.{" "}
        </div>
      )}

      <AuthNotice feedback={feedback} onDismiss={onDismissFeedback} />

      {verificationPending ? (
        <div className="register_form">
          <p>We sent a 6-digit verification code to <strong>{formData.email}</strong>. Enter it below to verify your email.</p>
          <form onSubmit={handleVerifyOtp}>
            <div className="field">
              <label htmlFor="emailOtp">Email verification code</label>
              <input id="emailOtp" className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" />
            </div>
            <button className="btn" type="submit" disabled={status === "loading" || otp.length !== 6}>{status === "loading" ? "Verifying..." : "Verify email"}</button>
          </form>
          <button className="btn btn_secondary" type="button" onClick={handleResendOtp} disabled={status === "loading"}>Resend code</button>
        </div>
      ) : verified ? (
        <div className="register_form">
          <div className="notice success">Email verified successfully. You can now sign in.</div>
          <button className="btn" type="button" onClick={goToLogin}>Go to login</button>
        </div>
      ) : (
      <form className="register_form" onSubmit={handleSubmit}>
        <div className="register_row">
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              className="input"
              name="firstName"
              required
              placeholder="Omar"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              className="input"
              name="lastName"
              required
              placeholder="Hassan"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="input_wrap">
            <span className="material-symbols-outlined">mail</span>
            <input
              id="email"
              className="input"
              name="email"
              type="email"
              required
              placeholder="name@domain.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <small>Admission updates are sent to this address.</small>
        </div>

        <div className="field">
          <label htmlFor="phone">Mobile number</label>
          <div className="register_phone">
            <Select
              className="input"
              name="phoneCode"
              aria-label="Country code"
              value={formData.phoneCode}
              onChange={handleChange}
            >
              {PHONE_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
            <input
              id="phone"
              className="input"
              name="phone"
              type="tel"
              required
              placeholder="10 1234 5678"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="campus">Campus</label>
          <Select
            id="campus"
            className="input"
            name="campus"
            value={formData.campus}
            onChange={handleChange}
          >
            {CAMPUSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="register_row">
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input_wrap">
              <span className="material-symbols-outlined">lock</span>
              <input
                id="password"
                className="input"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="input_wrap">
              <span className="material-symbols-outlined">lock</span>
              <input
                id="confirmPassword"
                className="input"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <ul className="register_rules">
          {rules.map((r) => (
            <li key={r.label} className={r.ok ? "ok" : ""}>
              <span className="material-symbols-outlined">
                {r.ok ? "check_circle" : "radio_button_unchecked"}
              </span>
              {r.label}
            </li>
          ))}
        </ul>

        <label className="register_agree">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
          />
          I agree to the academy's terms and privacy policy.
        </label>

        <button
          className="btn"
          type="submit"
          disabled={!canSubmit || status === "loading"}
        >
          Create account
        </button>
      </form>
      )}

      <p className="register_footer">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default memo(RegisterComponent);
