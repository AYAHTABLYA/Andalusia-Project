import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import type { loginFormType } from "../../Types/LoginFormType";
import type { Feedback } from "../../Types/Feedback";
import type { SubmitStatus } from "../../Types/SubmitStatus";
import {
  login,
  requestLoginOtp,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  saveAuthenticatedSession,
} from "../../apis/authApi";
import { isLoggedIn } from "../../apis/academyApi";
import { getStoredUser, homeRouteForRole } from "../../utils/session";
import { canOpenPath } from "../../utils/roles";

type LoginMode = "password" | "login-otp" | "forgot-request" | "forgot-reset";

function LoginContainer() {
  const navigate = useNavigate();
  const location = useLocation();

  // Page the user tried to open before being sent to /login (set by PortalLayout).
  const from = (location.state as { from?: string } | null)?.from;
  const afterLoginRoute = () => {
    const role = getStoredUser()?.role;
    return from && from !== "/login" && canOpenPath(role, from)
      ? from
      : homeRouteForRole(role);
  };

  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [mode, setMode] = useState<LoginMode>("password");
  const [formData, setFormData] = useState<loginFormType>({
    email: "",
    password: "",
  });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFeedback(null);
  };

  const showError = (error: any, fallback: string) => {
    const data = error.response?.data;
    const validation = data?.errors
      ? (Object.values(data.errors).flat() as string[])[0]
      : "";
    setFeedback({
      type: "error",
      text:
        !error.response && error.message === "Network Error"
          ? "Cannot reach the server. Check that the API is running."
          : validation ||
            data?.detail ||
            data?.title ||
            data?.message ||
            fallback,
    });
  };

  // Shared by password login and code login: store the session, then go to the portal.
  const completeSignIn = (response: unknown) => {
    saveAuthenticatedSession(response);
    setStatus("success");
    navigate(afterLoginRoute(), { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setStatus("loading");
      if (mode === "password") {
        completeSignIn(await login(formData));
      } else if (mode === "login-otp") {
        completeSignIn(
          await verifyLoginOtp({ email: formData.email, code: otp }),
        );
      } else if (mode === "forgot-request") {
        await forgotPassword({ email: formData.email });
        setMode("forgot-reset");
        setStatus("idle");
        setFeedback({
          type: "info",
          text: "If the email exists, a password reset code has been sent.",
        });
      } else {
        if (newPassword !== confirmPassword)
          throw new Error("Passwords do not match.");
        await resetPassword({ email: formData.email, token: otp, newPassword });
        setMode("password");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setStatus("idle");
        setFeedback({
          type: "success",
          text: "Password reset successfully. Please sign in with your new password.",
        });
      }
    } catch (error: any) {
      setStatus("idle");
      showError(
        error,
        error.message || "The request failed. Please try again.",
      );
    }
  };

  const switchMode = async (nextMode: LoginMode) => {
    setStatus("idle");
    setOtp("");
    setFeedback(null);
    if (nextMode === "login-otp") {
      if (!formData.email) {
        setFeedback({ type: "error", text: "Enter your email first." });
        return;
      }
      try {
        setStatus("loading");
        await requestLoginOtp({ email: formData.email });
        setMode(nextMode);
        setStatus("idle");
        setFeedback({
          type: "info",
          text: "If the verified account exists, a sign-in code has been sent.",
        });
      } catch (error: any) {
        setStatus("idle");
        showError(error, "Could not request a sign-in code.");
      }
      return;
    }
    setMode(nextMode);
  };

  // Already signed in (e.g. opened /login again) -> straight to the portal.
  if (isLoggedIn() && status !== "success") {
    return <Navigate to={afterLoginRoute()} replace />;
  }

  return (
    <AuthLayoutComponent
      title="Excellence in clinical, digital, and leadership education"
      text="One portal for students, mentors, coordinators, and administrators. Sign in and we take you to the right workspace."
      headerAction={
        <Link to="/" className="auth_back_link">
          <span className="material-symbols-outlined">arrow_back</span>Back to
          Main Platform
        </Link>
      }
    >
      <LoginComponent
        status={status}
        mode={mode}
        feedback={feedback}
        onDismissFeedback={() => setFeedback(null)}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        otp={otp}
        setOtp={setOtp}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        switchMode={switchMode}
      />
    </AuthLayoutComponent>
  );
}

export default LoginContainer;
