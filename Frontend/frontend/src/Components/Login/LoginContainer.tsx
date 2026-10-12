import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import type { loginFormType } from "../../Types/LoginFormType";
import type { SubmitStatus } from "../../Types/SubmitStatus";
import { login, requestLoginOtp, verifyLoginOtp, forgotPassword, resetPassword, saveAuthenticatedSession } from "../../apis/authApi";

type LoginMode = "password" | "login-otp" | "forgot-request" | "forgot-reset";
function LoginContainer() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [mode, setMode] = useState<LoginMode>("password");
  const [formData, setFormData] = useState<loginFormType>({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const showError = (error: any, fallback: string) => alert(error.response?.data?.detail || error.response?.data?.title || error.response?.data?.message || fallback);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setStatus("loading");
      if (mode === "password") {
        const response = await login(formData);
        saveAuthenticatedSession(response);
        setStatus("success");
        navigate("/");
      } else if (mode === "login-otp") {
        const response = await verifyLoginOtp({ email: formData.email, code: otp });
        saveAuthenticatedSession(response);
        setStatus("success");
        navigate("/");
      } else if (mode === "forgot-request") {
        await forgotPassword({ email: formData.email });
        setMode("forgot-reset");
        setStatus("idle");
        alert("If the email exists, a password reset code has been sent.");
      } else {
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
        await resetPassword({ email: formData.email, token: otp, newPassword });
        setMode("password");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setStatus("idle");
        alert("Password reset successfully. Please sign in with your new password.");
      }
    } catch (error: any) {
      setStatus("idle");
      showError(error, error.message || "The request failed. Please try again.");
    }
  };
  const switchMode = async (nextMode: LoginMode) => {
    setStatus("idle");
    setOtp("");
    if (nextMode === "login-otp") {
      if (!formData.email) { alert("Enter your email first."); return; }
      try {
        setStatus("loading");
        await requestLoginOtp({ email: formData.email });
        setMode(nextMode);
        setStatus("idle");
        alert("If the verified account exists, a sign-in code has been sent.");
      } catch (error: any) { setStatus("idle"); showError(error, "Could not request a sign-in code."); }
      return;
    }
    setMode(nextMode);
  };
  return (
    <AuthLayoutComponent title="Excellence in clinical, digital, and leadership education" text="One portal for students, mentors, coordinators, and administrators. Sign in and we take you to the right workspace." headerAction={<Link to="/" className="auth_back_link"><span className="material-symbols-outlined">arrow_back</span>Back to Main Platform</Link>}>
      <LoginComponent status={status} mode={mode} formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} otp={otp} setOtp={setOtp} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} switchMode={switchMode} />
    </AuthLayoutComponent>
  );
}
export default LoginContainer;
