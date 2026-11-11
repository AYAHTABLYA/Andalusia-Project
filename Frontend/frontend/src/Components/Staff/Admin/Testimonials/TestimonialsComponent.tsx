import { memo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { AdminTestimonial } from "../../../../Types/Admin";
import Select from "../../../Shared/Select/Select";

type TestimonialForm = {
  clientName: string;
  titleOrRole: string;
  quoteText: string;
  avatarUrl: string;
  rating: string;
  isFeatured: boolean;
  courseId: string;
};

type Props = {
  items: AdminTestimonial[];
  total: number;
  loading: boolean;
  errorMessage?: string;
  message: { type: "error" | "success"; text: string } | null;
  search: string;
  showForm: boolean;
  editingId: number | null;
  form: TestimonialForm;
  saving: boolean;
  busyId: number | null;
  onSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleForm: () => void;
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onEdit: (t: AdminTestimonial) => void;
  onDelete: (t: AdminTestimonial) => void;
  onCancel: () => void;
  onRetry: () => void;
};

const RATINGS = [5, 4, 3, 2, 1];

function TestimonialsComponent({
  items, total, loading, errorMessage, message, search, showForm, editingId, form, saving, busyId,
  onSearch, onToggleForm, onFormChange, onSubmit, onEdit, onDelete, onCancel, onRetry,
}: Props) {
  return (
    <>
      <div className="staff-page_head">
        <div>
          <h1 className="staff-page_title">Testimonials</h1>
          <p className="staff-page_sub">
            Learner quotes shown on the landing page. Only featured testimonials are displayed there.
          </p>
        </div>
        <button type="button" className="staff-btn" onClick={onToggleForm}>
          {showForm && editingId === null ? "Close" : "New testimonial"}
        </button>
      </div>

      {message && (
        <p className={message.type === "error" ? "staff-error" : "staff-page_sub"} role="status">
          {message.text}
        </p>
      )}

      {showForm && (
        <form className="staff-card" onSubmit={onSubmit}>
          <h2 className="staff-page_sub">{editingId !== null ? "Edit testimonial" : "New testimonial"}</h2>
          <div className="staff-form">
            <label className="staff-field">
              Name
              <input className="staff-input" name="clientName" value={form.clientName} onChange={onFormChange} required maxLength={120} />
            </label>
            <label className="staff-field">
              Title / role
              <input className="staff-input" name="titleOrRole" value={form.titleOrRole} onChange={onFormChange} required maxLength={160} />
            </label>
            <label className="staff-field staff-field--wide">
              Quote
              <textarea className="staff-input staff-textarea" name="quoteText" value={form.quoteText} onChange={onFormChange} required rows={4} maxLength={2000} />
            </label>
            <label className="staff-field">
              Rating
              <Select className="staff-select" name="rating" value={form.rating} onChange={onFormChange}>
                {RATINGS.map((r) => (
                  <option key={r} value={String(r)}>{"★".repeat(r)} ({r})</option>
                ))}
              </Select>
            </label>
            <label className="staff-field">
              Avatar URL (optional)
              <input className="staff-input" name="avatarUrl" type="url" value={form.avatarUrl} onChange={onFormChange} placeholder="https://..." />
            </label>
            <label className="staff-field">
              Course ID (optional)
              <input className="staff-input" name="courseId" type="number" min={1} step={1} value={form.courseId} onChange={onFormChange} />
            </label>
            <label className="staff-field">
              <span>Featured</span>
              <span>
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={onFormChange} /> Show on the landing page
              </span>
            </label>
          </div>
          <div className="staff-toolbar">
            <button type="submit" className="staff-btn" disabled={saving}>
              {saving ? "Saving..." : editingId !== null ? "Save changes" : "Create testimonial"}
            </button>
            <button type="button" className="staff-btn staff-btn--ghost" disabled={saving} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="staff-card" style={{ marginTop: "1rem" }}>
        <div className="staff-toolbar">
          <input className="staff-input" type="search" placeholder="Search name, role or quote" value={search} onChange={onSearch} aria-label="Search testimonials" />
          <span className="staff-page_sub">{total} total</span>
        </div>

        {errorMessage ? (
          <p className="staff-error">
            {errorMessage}{" "}
            <button type="button" className="staff-btn staff-btn--ghost" onClick={onRetry}>Retry</button>
          </p>
        ) : loading && items.length === 0 ? (
          <p className="staff-page_sub">Loading testimonials...</p>
        ) : items.length === 0 ? (
          <p className="staff-page_sub">
            {search ? "No testimonials match your search." : "No testimonials yet. Create the first one."}
          </p>
        ) : (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr><th>Name</th><th>Quote</th><th>Rating</th><th>Course</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.testimonialId}>
                    <td>
                      <strong>{t.clientName}</strong>
                      <br />
                      <small className="staff-page_sub">{t.titleOrRole}</small>
                    </td>
                    <td><span className="staff-clip">{t.quoteText}</span></td>
                    <td aria-label={`${t.rating} out of 5`}>{"★".repeat(t.rating)}</td>
                    <td>{t.courseTitle || (t.courseId ? `#${t.courseId}` : "—")}</td>
                    <td>
                      <span className={`staff-pill${t.isFeatured ? "" : " staff-pill--off"}`}>
                        {t.isFeatured ? "Featured" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <span className="staff-row-actions">
                        <button type="button" className="staff-btn staff-btn--ghost staff-btn--sm" disabled={busyId === t.testimonialId} onClick={() => onEdit(t)}>
                          Edit
                        </button>
                        <button type="button" className="staff-btn staff-btn--ghost staff-btn--sm" disabled={busyId === t.testimonialId} onClick={() => onDelete(t)}>
                          Delete
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export type { TestimonialForm };
export default memo(TestimonialsComponent);
