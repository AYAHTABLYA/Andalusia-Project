import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Dialog from "../Shared/Dialog";
import useCampuses from "../../../hooks/portalHooks/useCampuses";
import type { EditableProfile, ProfileData } from "../../../Types/Profile";
import "../Shared/style.css";
import "./style.css";

type Props = {
  profile: ProfileData;
  onClose: () => void;
  onSave: (values: EditableProfile) => Promise<void>;
};

function EditProfileDialog({ profile, onClose, onSave }: Props) {
  const [values, setValues] = useState<EditableProfile>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    title: profile.title,
    phone: profile.phone,
    campusId: profile.campusId,
  });
  const { data: campuses } = useCampuses();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === "campusId" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        title: values.title.trim(),
        phone: values.phone.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your changes.");
      setSaving(false);
    }
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
          <label htmlFor="campusId">Primary Campus</label>
          <select id="campusId" className="portal-ui_input" name="campusId" value={values.campusId ?? ""} onChange={handleChange}>
            {values.campusId === null && <option value="">{profile.campus}</option>}
            {(campuses ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="profile_form-note">
          <span className="material-symbols-outlined">info</span>
          <span>Updating your legal identity documents requires in-person submission at the campus registrar.</span>
        </div>

        {error && (
          <div className="profile_form-note" role="alert">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="profile_form-actions">
          <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="portal-ui_btn portal-ui_btn--primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export default EditProfileDialog;
