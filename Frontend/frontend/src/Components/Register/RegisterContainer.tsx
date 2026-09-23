import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import RegisterComponent from "./RegisterComponent";
import AuthLayoutComponent from "../AuthLayout/AuthLayoutComponent";
import type { registerFormType } from "../../Types/registerFormType";
import type { SubmitStatus } from "../../Types/SubmitStatus";

function RegisterContainer() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [formData, setFormData] = useState<registerFormType>({
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

  // UI only: no API call. Later map to registerFormType
  // ({ name: `${firstName} ${lastName}`, email, password }) and call useRegisterUser.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setTimeout(() => setStatus("success"), 1000);
  };

  return (
    <AuthLayoutComponent
      title="Begin your executive learning journey in Alexandria"
      text="Join certified in-person cohorts, executive masterclasses, and hands-on lab diplomas for medical leaders and enterprise practitioners."
      headerAction={<Link to="/login">Sign in</Link>}
    >
      <RegisterComponent
        status={status}
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
