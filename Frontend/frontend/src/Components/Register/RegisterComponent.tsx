import { memo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import type { registerFormType } from "../../Types/registerFormType";

import type { SubmitStatus } from "../../Types/SubmitStatus";
import { CAMPUSES, PHONE_CODES} from "./constants";
import "./style.css";

type ChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
) => void;

function RegisterComponent({
  status,
  rules,
  canSubmit,
  formData,
  handleChange,
  handleSubmit,
}: {
  status: SubmitStatus;
  rules: { label: string; ok: boolean }[];
  canSubmit: boolean;
  formData: registerFormType;
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
          Account created. Design preview only, no backend connected.
        </div>
      )}

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
            <select
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
            </select>
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
          <select
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
          </select>
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

      <p className="register_footer">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default memo(RegisterComponent);
