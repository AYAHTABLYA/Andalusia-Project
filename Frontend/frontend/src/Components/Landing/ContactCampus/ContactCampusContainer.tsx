import { useState } from "react";
import ContactCampusComponent from "./ContactCampusComponent";
import type { ApplicationFormType, SubmitStatus } from "./ApplicationFormType";
import { TRACK_OPTIONS, EXPERIENCE_OPTIONS } from "./constants";
import { ApiError, getErrorMessage } from "../../../apis/academyApi";
import { submitContactEnquiry } from "../../../hooks/academyHooks/useContactApi";

const INITIAL_FORM: ApplicationFormType = {
  fullName: "",
  email: "",
  phone: "",
  track: TRACK_OPTIONS[0],
  experience: EXPERIENCE_OPTIONS[0],
};

function ContactCampusContainer() {
  const [formData, setFormData] = useState<ApplicationFormType>(INITIAL_FORM);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Typing again dismisses the previous success / error notice.
    setStatus((prev) => (prev === "submitting" ? prev : "idle"));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");
    try {
      await submitContactEnquiry({
        fullName: formData.fullName.trim(),
        mobileNumber: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        desiredTrack: formData.track,
        experience: formData.experience,
      });
      setFormData(INITIAL_FORM);
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError && err.status === 429
          ? "Too many requests from this device. Please try again in a few minutes."
          : getErrorMessage(err, "We could not send your application. Please try again."),
      );
      setStatus("error");
    }
  }

  return (
    <ContactCampusComponent
      formData={formData}
      trackOptions={TRACK_OPTIONS}
      experienceOptions={EXPERIENCE_OPTIONS}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      status={status}
      errorMessage={errorMessage}
      onDismissNotice={() => setStatus("idle")}
    />
  );
}

export default ContactCampusContainer;
