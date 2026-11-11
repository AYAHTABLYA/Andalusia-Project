import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import AuthNotice from "../AuthLayout/AuthNotice";
import type { Feedback } from "../../Types/Feedback";
import { confirmEmail, resendConfirmation } from "../../apis/authApi";
import { ApiError, getErrorMessage, isLoggedIn } from "../../apis/academyApi";
import OtpInput from "./OtpInput";
import type { OtpStatus } from "./OtpInput";
import "../Register/Style.css";

type ConfirmLocationState = {
  email?: string;
  from?: string;
  notice?: string;
} | null;

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

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
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
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

  const verify = async (code: string) => {
    if (code.length !== OTP_LENGTH || loading) return;
    setFeedback(null);
    setLoading(true);
    try {
      await confirmEmail({ email, otp: code });
      setOtpStatus("success");
      setVerified(true);
    } catch (error) {
      setOtpStatus("error");
      setFeedback({
        type: "error",
        text: getErrorMessage(error, "The code is invalid or expired."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: FormEvent) => {
    e.preventDefault();
    void verify(otp);
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    // Editing after a wrong code clears the red state.
    if (otpStatus === "error") setOtpStatus("idle");
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setFeedback(null);
    setLoading(true);
    try {
      await resendConfirmation({ email });
      setOtp("");
      setOtpStatus("idle");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setFeedback({
        type: "info",
        text: "A new confirmation code has been sent to your email.",
      });
    } catch (error) {
      // 429 = the backend cooldown is still running; sync our timer with it.
      if (error instanceof ApiError && error.status === 429) {
        const secondsLeft = Number(
          (error.data as { secondsLeft?: number } | undefined)?.secondsLeft,
        );
        if (secondsLeft > 0) setCooldown(secondsLeft);
      }
      setFeedback({
        type: "error",
        text: getErrorMessage(
          error,
          "Could not resend the code. Please try again.",
        ),
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
          <span className="material-symbols-outlined icon-dir">arrow_back</span>Back to
          Login
        </Link>
      }
    >
      <div className="register_form_component">
        <div className="register_head">
          <h2>Confirm your email</h2>
          {/* <span lang="ar">تأكيد البريد الإلكتروني</span> */}
        </div>

        {verified ? (
          <div className="register_form">
            <div className="otp_done" aria-hidden="true">
              <span className="material-symbols-outlined">verified</span>
            </div>
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
              Your email is not confirmed yet. We sent a 6-digit code to{" "}
              <strong>{email}</strong>. Enter it below to continue.
            </p>

            <AuthNotice
              feedback={feedback}
              onDismiss={() => setFeedback(null)}
            />

            <div className="register_form">
              <form onSubmit={handleVerify}>
                <div className="field">
                  <span id="otp-label" className="otp_label">
                    Email confirmation code
                  </span>
                  <OtpInput
                    value={otp}
                    onChange={handleOtpChange}
                    onComplete={(code) => void verify(code)}
                    length={OTP_LENGTH}
                    disabled={loading}
                    status={otpStatus}
                    autoFocus
                    labelledBy="otp-label"
                  />
                  <p className="otp_hint">
                    <span className="material-symbols-outlined">schedule</span>
                    {"The code expires in 10 minutes. Check your spam folder if you can't find it."}
                  </p>
                </div>
                <button
                  className="btn"
                  type="submit"
                  disabled={loading || otp.length !== OTP_LENGTH}
                >
                  {loading ? "Please wait..." : "Confirm email"}
                </button>
              </form>

              <div className="otp_resend">
                <div className="otp_resend_row">
                  <span>{"Didn't get the code?"}</span>
                  <button
                    className="otp_resend_btn"
                    type="button"
                    onClick={handleResend}
                    disabled={loading || cooldown > 0}
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    <span>{cooldown > 0 ? "Resend code in" : "Resend code"}</span>
                    {cooldown > 0 && <span>{cooldown}s</span>}
                  </button>
                </div>
                <div className="otp_progress" aria-hidden="true">
                  <span
                    style={{
                      transform: `scaleX(${Math.min(1, cooldown / RESEND_COOLDOWN_SECONDS)})`,
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthLayoutComponent>
  );
}

export default ConfirmEmailContainer;
