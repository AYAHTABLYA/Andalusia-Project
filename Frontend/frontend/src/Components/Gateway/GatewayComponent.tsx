import { memo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import type { loginFormType } from "../../Types/LoginFormType";
import type { SubmitStatus } from "../../Types/SubmitStatus";
import { ROLES } from "./constants";
import "./Style.css";

function GatewayComponent({
  role,
  setRole,
  status,
  formData,
  handleChange,
  handleSubmit,
}: {
  role: string;
  setRole: (role: string) => void;
  status: SubmitStatus;
  formData: loginFormType;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const current = ROLES.find((r) => r.key === role) ?? ROLES[0];

  return (
    <div className="gateway_form_component">
      <h2>Welcome back</h2>
      <div className="segmented gateway_roles" role="group" aria-label="Portal">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            aria-pressed={r.key === role}
            onClick={() => setRole(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="gateway_intro">
        <h3>{current.heading}</h3>
        <p>{current.desc}</p>
      </div>

      {status === "loading" && (
        <div className="notice">
          <span className="spinner" />
          Signing you in as {current.label.toLowerCase()}...
        </div>
      )}
      {status === "success" && (
        <div className="notice success">
          <span className="material-symbols-outlined">check_circle</span>
          Signed in. Design preview only, no backend connected.
        </div>
      )}

      <form className="gateway_form" onSubmit={handleSubmit}>
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
              placeholder="name@andalusia-academy.edu.eg"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <div className="gateway_password_row">
            <label htmlFor="password">Password</label>
            <a href="#forgot">Forgot password?</a>
          </div>
          <div className="input_wrap">
            <span className="material-symbols-outlined">lock</span>
            <input
              id="password"
              className="input"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
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

        <button className="btn" type="submit" disabled={status === "loading"}>
          {current.button}
        </button>
      </form>

      <p className="gateway_footer">
        New learner? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}

export default memo(GatewayComponent);
