import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Dialog from "../Shared/Dialog";
import { CAMPUS_OPTIONS } from "./constants";
import type { EditableProfile, ProfileData } from "../../../Types/Profile";
import "../Shared/style.css";
import "./style.css";

type Props = {
  profile: ProfileData;
  onClose: () => void;
  onSave: (values: EditableProfile) => void;
};

function EditProfileDialog({ profile, onClose, onSave }: Props) {
  const [values, setValues] = useState<EditableProfile>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    title: profile.title,
    phone: profile.phone,
    campus: profile.campus,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      title: values.title.trim(),
      phone: values.phone.trim(),
    });
  };

  return (
    <Dialog icon="edit_square" title="Edit Learner Profile" onClose={onClose}>
      <form className="profile_form" onSubmit={handleSubmit}>
        <div className="profile_form-row">
          <div className="portal-ui_field">
            <label htmlFor="firstName">First Name</label>
            <input id="firstName" className="portal-ui_input" name="firstName" required value={values.firstName} onChange={handleChange} />
          </div>
          <div className="portal-ui_field">
            <label htmlFor="lastName">Last Name</label>
            <input id="lastName" className="portal-ui_input" name="lastName" required value={values.lastName} onChange={handleChange} />
          </div>
        </div>

        <div className="portal-ui_field">
          <label htmlFor="title">Professional Title</label>
          <input id="title" className="portal-ui_input" name="title" value={values.title} onChange={handleChange} />
        </div>

        <div className="profile_form-row">
          <div className="portal-ui_field">
            <label htmlFor="email">Email</label>
            <input id="email" className="portal-ui_input" type="email" disabled value={profile.email} readOnly />
            <span className="portal-ui_hint">Your login email can&apos;t be changed here.</span>
          </div>
          <div className="portal-ui_field">
            <label htmlFor="phone">Direct Phone</label>
            <input id="phone" className="portal-ui_input" name="phone" required value={values.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="portal-ui_field">
          <label htmlFor="campus">Primary Campus</label>
          <select id="campus" className="portal-ui_input" name="campus" value={values.campus} onChange={handleChange}>
            {CAMPUS_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="profile_form-note">
          <span className="material-symbols-outlined">info</span>
          <span>Updating your legal identity documents requires in-person submission at the campus registrar.</span>
        </div>

        <div className="profile_form-actions">
          <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="portal-ui_btn portal-ui_btn--primary">Save Changes</button>
        </div>
      </form>
    </Dialog>
  );
}

export default EditProfileDialog;
