import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import LoginComponent from "./LoginComponent";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import type { loginFormType } from "../../Types/LoginFormType";
import type { SubmitStatus } from "../../Types/SubmitStatus";
import { ROLES } from "./constants";

function LoginContainer() {
  const [role, setRole] = useState<string>(ROLES[0].key);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [formData, setFormData] = useState<loginFormType>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // UI only: no API call. Replace with useLoginUser(...) when the backend is ready.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => setStatus("success"), 1000);
  };

  return (
    <AuthLayoutComponent
      title="Excellence in clinical, digital, and leadership education"
      text="One portal for students, mentors, coordinators, and administrators. Sign in and we take you to the right workspace."
      headerAction={<Link to="/register">Create account</Link>}
    >
      <LoginComponent
        role={role}
        setRole={setRole}
        status={status}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </AuthLayoutComponent>
  );
}

export default LoginContainer;
