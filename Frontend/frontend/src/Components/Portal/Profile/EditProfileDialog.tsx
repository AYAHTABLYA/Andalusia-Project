import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Dialog from "../Shared/Dialog";
import { initials, resolveAssetUrl } from "../../../utils/format";
import useCampuses from "../../../hooks/portalHooks/useCampuses";
import type { EditableProfile, ProfileData } from "../../../Types/Profile";
import "../Shared/style.css";
import "./style.css";
import Select from "../../Shared/Select/Select";

type Props = {
  profile: ProfileData;
  onClose: () => void;
  onSave: (values: EditableProfile, photo: File | null) => Promise<void>;
};

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // object-URL preview of the newly chosen photo (revoked on change / unmount)
  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows picking the same file again
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("The image is too large. Maximum size is 2 MB.");
      return;
    }
    setError("");
    setPhoto(file);
  };

  const shownPhoto = preview ?? resolveAssetUrl(profile.photoUrl);

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
      }, photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your changes.");
      setSaving(false);
    }
  };

  return (
    <Dialog icon="edit_square" title="Edit Learner Profile" onClose={onClose}>
      <form className="profile_form" onSubmit={handleSubmit}>
        <div className="profile_photo">
          <span className="profile_photo-preview">
            {shownPhoto ? (
              <img src={shownPhoto} alt="" />
            ) : (
              <span>{initials(`${values.firstName} ${values.lastName}`)}</span>
            )}
          </span>
          <div className="profile_photo-actions">
            <strong>Profile photo</strong>
            <div className="profile_photo-buttons">
              <button type="button" className="portal-ui_btn portal-ui_btn--outline portal-ui_btn--sm" onClick={() => fileInput.current?.click()}>
                <span className="material-symbols-outlined">upload</span>
                {shownPhoto ? "Change photo" : "Upload photo"}
              </button>
              {photo && (
                <button type="button" className="portal-ui_btn portal-ui_btn--outline portal-ui_btn--sm" onClick={() => setPhoto(null)}>
                  Undo
                </button>
              )}
            </div>
            <span className="portal-ui_hint">JPG, PNG or WebP, up to 2 MB.</span>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handlePhoto} />
          </div>
        </div>

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
          <Select id="campusId" className="portal-ui_input" name="campusId" value={values.campusId ?? ""} onChange={handleChange}>
            {values.campusId === null && <option value="">{profile.campus}</option>}
            {(campuses ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
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
