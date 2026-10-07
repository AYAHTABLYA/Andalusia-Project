import { memo } from "react";
import type { ApplicationFormType } from "./ApplicationFormType";
import "./style.css";

function ContactCampusComponent({
  formData,
  handleChange,
  handleSubmit,
}: {
  formData: ApplicationFormType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="contact-campus" data-purpose="alexandria-campus-info" id="contact-campus">
      <div className="section-wrap contact-campus_grid">
        <div className="contact-campus_info">
          <span className="eyebrow">In-Person Learning Space</span>
          <h2 className="heading-serif">The Alexandria Executive Campus</h2>
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
                <label htmlFor="email">Corporate Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="track">Desired Track</label>
                <select id="track" name="track" value={formData.track} onChange={handleChange}>
                  <option>Generative AI &amp; LLMs (Offline)</option>
                  <option>FinTech Architecture (Blended)</option>
                  <option>DevSecOps &amp; Zero Trust (Offline)</option>
                  <option>Custom Corporate Program</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="experience">
                Years of Technical / Management Experience
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
              >
                <option>1 - 3 Years (Mid-level Practitioner)</option>
                <option>4 - 7 Years (Senior Engineer / Lead)</option>
                <option>8+ Years (Director / VP / Head)</option>
              </select>
            </div>

            <button type="submit" className="contact-campus_submit">
              Submit Cohort Application
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default memo(ContactCampusComponent);
