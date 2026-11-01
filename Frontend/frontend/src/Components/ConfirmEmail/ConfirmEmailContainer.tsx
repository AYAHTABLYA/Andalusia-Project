import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import AuthNotice from "../AuthLayout/AuthNotice";
import type { Feedback } from "../../Types/Feedback";
import { confirmEmail, resendConfirmation } from "../../apis/authApi";
import { ApiError, getErrorMessage, isLoggedIn } from "../../apis/academyApi";
import "../Register/Style.css";

type ConfirmLocationState = { email?: string; from?: string; notice?: string } | null;

const RESEND_COOLDOWN_SECONDS = 60;

// Email confirmation page (/confirm-email).
// Login sends users here when the backend answers 403 EMAIL_NOT_CONFIRMED; the backend has
// already emailed a fresh 6-digit code at that point, so the user can type it straight away.
function ConfirmEmailContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const state = location.state as ConfirmLocationState;
  const email = (state?.email ?? searchParams.get("email") ?? "").trim();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [feedback, setFeedback] = useState<Feedback>(
    state?.notice ? { type: "info", text: state.notice } : null,
  );

  // Resend button countdown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  // Nothing to confirm without an email: back to the login form.
  if (!email) return <Navigate to="/login" replace />;
  if (isLoggedIn() && !verified) return <Navigate to="/" replace />;

  const goToLogin = () =>
    navigate("/login", {
      replace: true,
      state: { from: state?.from, email, emailConfirmed: true },
    });

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || loading) return;
    setFeedback(null);
    setLoading(true);
    try {
      await confirmEmail({ email, otp });
      setVerified(true);
    } catch (error) {
      setFeedback({
        type: "error",
        text: getErrorMessage(error, "The code is invalid or expired."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setFeedback(null);
    setLoading(true);
    try {
      await resendConfirmation({ email });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setFeedback({ type: "info", text: "A new confirmation code has been sent to your email." });
    } catch (error) {
      // 429 = the backend cooldown is still running; sync our timer with it.
      if (error instanceof ApiError && error.status === 429) {
        const secondsLeft = Number((error.data as { secondsLeft?: number } | undefined)?.secondsLeft);
        if (secondsLeft > 0) setCooldown(secondsLeft);
      }
      setFeedback({
        type: "error",
        text: getErrorMessage(error, "Could not resend the code. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayoutComponent
      title="One last step before you start learning"
      text="Confirm your email address to activate your account and access your learner workspace."
      headerAction={
        <Link to="/login" className="auth_back_link">
          <span className="material-symbols-outlined">arrow_back</span>Back to Login
        </Link>
      }
    >
      <div className="register_form_component">
        <div className="register_head">
          <h2>Confirm your email</h2>
          <span lang="ar">تأكيد البريد الإلكتروني</span>
        </div>

        {verified ? (
          <div className="register_form">
            <div className="notice success">
              <span className="material-symbols-outlined">check_circle</span>
              Email confirmed successfully. You can now sign in.
            </div>
            <button className="btn" type="button" onClick={goToLogin}>
              Go to login
            </button>
          </div>
        ) : (
          <>
            <p className="register_sub">
              Your email is not confirmed yet. We sent a 6-digit code to <strong>{email}</strong>. Enter it
              below to continue.
            </p>

            <AuthNotice feedback={feedback} onDismiss={() => setFeedback(null)} />

            <div className="register_form">
              <form onSubmit={handleVerify}>
                <div className="field">
                  <label htmlFor="emailOtp">Email confirmation code</label>
                  <input
                    id="emailOtp"
                    className="input"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    autoFocus
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
                <button className="btn" type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? "Please wait..." : "Confirm email"}
                </button>
              </form>
              <button
                className="btn btn_secondary"
                type="button"
                onClick={handleResend}
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </>
        )}
      </div>
    </AuthLayoutComponent>
  );
}

export default ConfirmEmailContainer;
