import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Feedback } from "../../Types/Feedback";
import RegisterComponent from "./RegisterComponent";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import type { RegisterFormValues } from "../../Types/registerFormType";
import type { SubmitStatus } from "../../Types/SubmitStatus";
import { register, confirmEmail, resendConfirmation } from "../../apis/authApi";
function RegisterContainer() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [verificationPending, setVerificationPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+20",
    phone: "",
    campus: "alexandria-gleem",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const next =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: next }));
  };

  const { password, confirmPassword } = formData;
  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One number", ok: /[0-9]/.test(password) },
    {
      label: "Passwords match",
      ok: confirmPassword.length > 0 && password === confirmPassword,
    },
  ];
  const canSubmit = rules.every((r) => r.ok) && formData.agree;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;
    setFeedback(null);

    try {
      setStatus("loading");

      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: `${formData.phoneCode}${formData.phone}`,
        password: formData.password,
        campusId:
          formData.campus === "alexandria-gleem"
            ? 1
            : formData.campus === "alexandria-smouha"
              ? 2
              : 3,
      });

      setStatus("success");
      setVerificationPending(true);
    } catch (error: any) {
      setStatus("idle");

      const data = error.response?.data;
      const validationErrors = data?.errors
        ? (Object.values(data.errors).flat() as string[]).join("\n")
        : "";
      const message = !error.response
        ? "Cannot reach the server. Check that the API is running and allows this site (CORS)."
        : validationErrors ||
          data?.detail ||
          data?.message ||
          data?.title ||
          "Registration failed. Please try again.";

      console.error("Register failed:", error.response?.status, data ?? error);
      setFeedback({ type: "error", text: message });
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setStatus("loading");
      await confirmEmail({ email: formData.email, otp });
      setVerified(true);
      setVerificationPending(false);
      setStatus("success");
    } catch (error: any) {
      setStatus("idle");
      setFeedback({
        type: "error",
        text:
          error.response?.data?.detail ||
          error.response?.data?.title ||
          "The code is invalid or expired.",
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      setStatus("loading");
      await resendConfirmation({ email: formData.email });
      setStatus("idle");
      setFeedback({
        type: "info",
        text: "If the account can receive a code, a new code has been sent.",
      });
    } catch (error: any) {
      setStatus("idle");
      setFeedback({
        type: "error",
        text:
          error.response?.data?.detail ||
          "Could not resend the code. Please try again.",
      });
    }
  };

  return (
    <AuthLayoutComponent
      title="Begin your executive learning journey in Alexandria"
      text="Join certified in-person cohorts, executive masterclasses, and hands-on lab diplomas for medical leaders and enterprise practitioners."
      headerAction={
        <span className="auth_header_pill">
          Already registered?
          <Link to="/login" className="auth_header_pill-btn">
            Sign In
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </span>
      }
    >
      <RegisterComponent
        status={status}
        feedback={feedback}
        onDismissFeedback={() => setFeedback(null)}
        verificationPending={verificationPending}
        verified={verified}
        otp={otp}
        setOtp={setOtp}
        handleVerifyOtp={handleVerifyOtp}
        handleResendOtp={handleResendOtp}
        goToLogin={() => navigate("/login")}
        rules={rules}
        canSubmit={canSubmit}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </AuthLayoutComponent>
  );
}

export default RegisterContainer;
