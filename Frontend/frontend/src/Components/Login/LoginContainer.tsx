import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import type { loginFormType } from "../../Types/LoginFormType";
import type { SubmitStatus } from "../../Types/SubmitStatus";
import { login } from "../../apis/authApi";
function LoginContainer() {
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

      await login({
        email: formData.email,
        password: formData.password,
      });

      setStatus("success");
    } catch (error: any) {
      setStatus("idle");

      const message =
        error.response?.data?.message ||
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
