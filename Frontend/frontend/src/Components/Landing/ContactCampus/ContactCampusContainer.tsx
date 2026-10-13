import { useState } from "react";
import ContactCampusComponent from "./ContactCampusComponent";
import type { ApplicationFormType } from "./ApplicationFormType";

const INITIAL_FORM: ApplicationFormType = {
  fullName: "",
  email: "",
  phone: "",
  track: "Generative AI & LLMs (Offline)",
  experience: "1 - 3 Years (Mid-level Practitioner)",
};

function ContactCampusContainer() {
  const [formData, setFormData] = useState<ApplicationFormType>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Cohort application submitted:", formData);
    setSubmitted(true);
    setFormData(INITIAL_FORM);
  }

  return (
    <ContactCampusComponent
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      submitted={submitted}
      onDismissSubmitted={() => setSubmitted(false)}
    />
  );
}

export default ContactCampusContainer;
