import { memo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import type { loginFormType } from "../../Types/LoginFormType";
import type { SubmitStatus } from "../../Types/SubmitStatus";
import AuthNotice from "../AuthLayout/AuthNotice";
import type { Feedback } from "../../Types/Feedback";
import "./Style.css";

type LoginMode = "password" | "login-otp" | "forgot-request" | "forgot-reset";
function LoginComponent({ status, mode, feedback, onDismissFeedback, formData, handleChange, handleSubmit, otp, setOtp, newPassword, setNewPassword, confirmPassword, setConfirmPassword, switchMode }: {
  status: SubmitStatus; mode: LoginMode; feedback: Feedback; onDismissFeedback: () => void; formData: loginFormType; handleChange: (e: ChangeEvent<HTMLInputElement>) => void; handleSubmit: (e: FormEvent) => void;
  otp: string; setOtp: (value: string) => void; newPassword: string; setNewPassword: (value: string) => void; confirmPassword: string; setConfirmPassword: (value: string) => void; switchMode: (mode: LoginMode) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const titles: Record<LoginMode, string> = { password: "Log in", "login-otp": "Sign in with a code", "forgot-request": "Forgot password?", "forgot-reset": "Reset password" };
  const descriptions: Record<LoginMode, string> = { password: "Sign in to your account", "login-otp": "Enter the 6-digit code sent to your email", "forgot-request": "We’ll send a reset code if this email is registered", "forgot-reset": "Enter the code from your email and choose a new password" };
  return <div className="login_form_component">
    <div className="login_intro"><h2>{titles[mode]}</h2><p>{descriptions[mode]}</p></div>
    {status === "loading" && <div className="notice"><span className="spinner" />Processing...</div>}
    {status === "success" && <div className="notice success"><span className="material-symbols-outlined">check_circle</span>Signed in successfully.</div>}
    <AuthNotice feedback={feedback} onDismiss={onDismissFeedback} />
    <form className="login_form" onSubmit={handleSubmit}>
      <div className="field"><label htmlFor="email">Email</label><div className="input_wrap"><span className="material-symbols-outlined">mail</span><input id="email" className="input" name="email" type="email" required placeholder="name@andalusia-academy.edu.eg" value={formData.email} onChange={handleChange} /></div></div>
      {mode === "password" && <div className="field"><div className="login_password_row"><label htmlFor="password">Password</label><button type="button" className="text_button" onClick={() => switchMode("forgot-request")}>Forgot password?</button></div><div className="input_wrap"><span className="material-symbols-outlined">lock</span><input id="password" className="input" name="password" type={showPassword ? "text" : "password"} required placeholder="Enter your password" value={formData.password} onChange={handleChange} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((s) => !s)}><span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span></button></div></div>}
      {(mode === "login-otp" || mode === "forgot-reset") && <div className="field"><label htmlFor="otp">6-digit email code</label><input id="otp" className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} /></div>}
      {mode === "forgot-reset" && <><div className="field"><label htmlFor="newPassword">New password</label><input id="newPassword" className="input" type="password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div><div className="field"><label htmlFor="confirmNewPassword">Confirm new password</label><input id="confirmNewPassword" className="input" type="password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div></>}
      <button className="btn" type="submit" disabled={status === "loading" || ((mode === "login-otp" || mode === "forgot-reset") && otp.length !== 6)}>{status === "loading" ? "Please wait..." : mode === "password" ? "Log in" : mode === "login-otp" ? "Verify code & sign in" : mode === "forgot-request" ? "Send reset code" : "Reset password"}</button>
    </form>
    {mode === "password" && <p className="login_footer"><button type="button" className="text_button" onClick={() => switchMode("login-otp")}>Sign in with email code</button></p>}
    {mode !== "password" && <p className="login_footer"><button type="button" className="text_button" onClick={() => switchMode("password")}>Back to password login</button></p>}
    <p className="login_footer">New learner? <Link to="/register">Create an account</Link></p>
  </div>;
}
export default memo(LoginComponent);
