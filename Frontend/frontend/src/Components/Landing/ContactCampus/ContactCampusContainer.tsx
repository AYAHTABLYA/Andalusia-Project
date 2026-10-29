import { useState } from "react";
import ContactCampusComponent from "./ContactCampusComponent";
import type { ApplicationFormType } from "./ApplicationFormType";
import { TRACK_OPTIONS, EXPERIENCE_OPTIONS } from "./constants";

// There is no API endpoint for this form yet, so it prepares an email to the admissions desk
// instead of pretending the request was sent.
const ADMISSIONS_EMAIL = "admissions@andalusia-academy.edu.eg";

const INITIAL_FORM: ApplicationFormType = {
  fullName: "",
  email: "",
  phone: "",
  track: TRACK_OPTIONS[0],
  experience: EXPERIENCE_OPTIONS[0],
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
    const body = [
      `Full name: ${formData.fullName}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone}`,
      `Track: ${formData.track}`,
      `Experience: ${formData.experience}`,
    ].join("\n");
    window.location.href = `mailto:${ADMISSIONS_EMAIL}?subject=${encodeURIComponent(
      "Cohort application",
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <ContactCampusComponent
      formData={formData}
      trackOptions={TRACK_OPTIONS}
      experienceOptions={EXPERIENCE_OPTIONS}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      submitted={submitted}
      onDismissSubmitted={() => setSubmitted(false)}
    />
  );
}

export default ContactCampusContainer;
