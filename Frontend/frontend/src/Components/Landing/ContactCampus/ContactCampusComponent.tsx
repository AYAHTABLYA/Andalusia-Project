import { memo } from "react";
import type { ApplicationFormType, SubmitStatus } from "./ApplicationFormType";
import "./style.css";
import Select from "../../Shared/Select/Select";

function ContactCampusComponent({
  formData,
  trackOptions,
  experienceOptions,
  handleChange,
  handleSubmit,
  status,
  errorMessage,
  onDismissNotice,
}: {
  formData: ApplicationFormType;
  trackOptions: string[];
  experienceOptions: string[];
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: SubmitStatus;
  errorMessage: string;
  onDismissNotice: () => void;
}) {
  return (
    <section className="contact-campus" data-purpose="alexandria-campus-info" id="contact-campus">
      <div className="section-wrap contact-campus_grid">
        <div className="contact-campus_info">
          <span className="eyebrow">In-Person Learning Space</span>
          <h2 className="heading-serif">The Executive Campus</h2>
          <p>
            Designed explicitly for peer collaboration, quiet research
            pods, high-bandwidth compute terminals, and executive
            networking mixers.
          </p>

          <div className="contact-campus_details">
            <div>
              <strong>Campus Address:</strong>
              <span>El-Horeya Avenue, Gleem District, Floor 4, Alexandria, Egypt</span>
            </div>
            <div>
              <strong>Admissions &amp; Registrations Desk:</strong>
              <span>admissions@andalusia-academy.edu.eg • +20 (3) 584-9020</span>
            </div>
            <div>
              <strong>Campus Open Hours:</strong>
              <span>
                Saturday – Thursday: 09:00 AM – 09:30 PM (Friday: Executive
                Sessions Only)
              </span>
            </div>
          </div>

          <div className="contact-campus_visitors">
            <span className="contact-campus_visitors-dot" aria-hidden="true" />
            <strong>Visitors Welcome:</strong>
            <span>Tour the hardware labs during weekday reception hours.</span>
          </div>
        </div>

        <div className="contact-campus_form-wrap card" id="apply-now">
          <h3>Request Admission Interview</h3>
          <p>Cohort seats are capped to maintain 1:12 mentor-to-learner ratio.</p>

          <form data-purpose="application-form" onSubmit={handleSubmit}>
            <div className="contact-campus_form-row">
              <div>
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Youssef El-Sherif"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email">Corporate Email (Optional)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="contact-campus_form-row">
              <div>
                <label htmlFor="phone">Mobile / WhatsApp</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+20 1..."
                  maxLength={20}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="track">Desired Track</label>
                <Select id="track" name="track" value={formData.track} onChange={handleChange}>
                  {trackOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="experience">
                Years of Technical / Management Experience (Optional)
              </label>
              <Select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
              >
                {experienceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </div>

            {(status === "success" || status === "error") && (
              <div
                className={
                  "contact-campus_notice" +
                  (status === "error" ? " contact-campus_notice--error" : "")
                }
                role={status === "error" ? "alert" : "status"}
              >
                <span className="material-symbols-outlined">
                  {status === "error" ? "error" : "check_circle"}
                </span>
                <span className="contact-campus_notice-text">
                  {status === "error"
                    ? errorMessage
                    : "Thank you! We received your application. Our admissions team will contact you within 2 business days."}
                </span>
                <button
                  type="button"
                  className="contact-campus_notice-close"
                  aria-label="Dismiss message"
                  onClick={onDismissNotice}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}

            <button
              type="submit"
              className="contact-campus_submit"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Submitting…" : "Submit Application"}
            </button>
            <p className="contact-campus_privacy">
              Submissions are kept strictly confidential under educational data
              protection standards.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default memo(ContactCampusComponent);
