import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import type { loginFormType } from "../../Types/LoginFormType";
import type { SubmitStatus } from "../../Types/SubmitStatus";
import { login } from "../../apis/authApi";
import { saveSession } from "../../utils/session";
import type { AuthResponse } from "../../Types/Auth";
function LoginContainer() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [formData, setFormData] = useState<loginFormType>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setStatus("loading");

      const auth: AuthResponse = await login({
        email: formData.email,
        password: formData.password,
      });

      saveSession(auth);
      setStatus("success");
      navigate("/profile");
    } catch (error: any) {
      setStatus("idle");

      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.title ||
        "Login failed. Please check your email and password.";

      alert(message);
    }
  };
  return (
    <AuthLayoutComponent
      title="Excellence in clinical, digital, and leadership education"
      text="One portal for students, mentors, coordinators, and administrators. Sign in and we take you to the right workspace."
      headerAction={
        <Link to="/" className="auth_back_link">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Main Platform
        </Link>
      }
    >
      <LoginComponent
        status={status}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </AuthLayoutComponent>
  );
}

export default LoginContainer;
