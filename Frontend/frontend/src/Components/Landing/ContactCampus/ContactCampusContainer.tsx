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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Cohort application submitted:", formData);
    alert("Application submitted! Our admissions director will contact you.");
    setFormData(INITIAL_FORM);
  }

  return (
    <ContactCampusComponent
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  );
}

export default ContactCampusContainer;
