import { memo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { AdminFaq } from "../../../../Types/Admin";

type FaqForm = { question: string; answer: string; orderIndex: string; categoryId: string; isActive: boolean };

type Props = {
  items: AdminFaq[];
  total: number;
  loading: boolean;
  errorMessage?: string;
  message: { type: "error" | "success"; text: string } | null;
  search: string;
  showForm: boolean;
  editingId: number | null;
  form: FaqForm;
  saving: boolean;
  busyId: number | null;
  onSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleForm: () => void;
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onEdit: (faq: AdminFaq) => void;
  onDelete: (faq: AdminFaq) => void;
  onCancel: () => void;
  onRetry: () => void;
};

function FaqsComponent({
  items, total, loading, errorMessage, message, search, showForm, editingId, form, saving, busyId,
  onSearch, onToggleForm, onFormChange, onSubmit, onEdit, onDelete, onCancel, onRetry,
}: Props) {
  return (
    <>
      <div className="staff-page_head">
        <div>
          <h1 className="staff-page_title">FAQs</h1>
          <p className="staff-page_sub">
            Questions shown in the landing page FAQ section, in display order. Wrap words in **double asterisks** to bold them.
          </p>
        </div>
        <button type="button" className="staff-btn" onClick={onToggleForm}>
          {showForm && editingId === null ? "Close" : "New FAQ"}
        </button>
      </div>

      {message && (
        <p className={message.type === "error" ? "staff-error" : "staff-page_sub"} role="status">
          {message.text}
        </p>
      )}

      {showForm && (
        <form className="staff-card" onSubmit={onSubmit}>
          <h2 className="staff-page_sub">{editingId !== null ? "Edit FAQ" : "New FAQ"}</h2>
          <div className="staff-form">
            <label className="staff-field staff-field--wide">
              Question
              <input className="staff-input" name="question" value={form.question} onChange={onFormChange} required maxLength={300} />
            </label>
            <label className="staff-field staff-field--wide">
              Answer
              <textarea className="staff-input staff-textarea" name="answer" value={form.answer} onChange={onFormChange} required rows={5} maxLength={4000} />
            </label>
            <label className="staff-field">
              Display order (optional)
              <input className="staff-input" name="orderIndex" type="number" min={0} step={1} value={form.orderIndex} onChange={onFormChange} placeholder="Auto (end of category)" />
            </label>
            <label className="staff-field">
              Category ID (optional)
              <input className="staff-input" name="categoryId" type="number" min={1} step={1} value={form.categoryId} onChange={onFormChange} />
            </label>
            <label className="staff-field">
              <span>Active</span>
              <span>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={onFormChange} /> Show on the landing page
              </span>
            </label>
          </div>
          <div className="staff-toolbar">
            <button type="submit" className="staff-btn" disabled={saving}>
              {saving ? "Saving..." : editingId !== null ? "Save changes" : "Create FAQ"}
            </button>
            <button type="button" className="staff-btn staff-btn--ghost" disabled={saving} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="staff-card" style={{ marginTop: "1rem" }}>
        <div className="staff-toolbar">
          <input className="staff-input" type="search" placeholder="Search questions or answers" value={search} onChange={onSearch} aria-label="Search FAQs" />
          <span className="staff-page_sub">{total} total</span>
        </div>

        {errorMessage ? (
          <p className="staff-error">
            {errorMessage}{" "}
            <button type="button" className="staff-btn staff-btn--ghost" onClick={onRetry}>Retry</button>
          </p>
        ) : loading && items.length === 0 ? (
          <p className="staff-page_sub">Loading FAQs...</p>
        ) : items.length === 0 ? (
          <p className="staff-page_sub">{search ? "No FAQs match your search." : "No FAQs yet. Create the first one."}</p>
        ) : (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr><th>Order</th><th>Question</th><th>Answer</th><th>Category</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.faqId}>
                    <td>{f.orderIndex}</td>
                    <td><strong>{f.question}</strong></td>
                    <td><span className="staff-clip">{f.answer}</span></td>
                    <td>{f.categoryName || (f.categoryId ? `#${f.categoryId}` : "General")}</td>
                    <td>
                      <span className={`staff-pill${f.isActive ? "" : " staff-pill--off"}`}>
                        {f.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <span className="staff-row-actions">
                        <button type="button" className="staff-btn staff-btn--ghost staff-btn--sm" disabled={busyId === f.faqId} onClick={() => onEdit(f)}>
                          Edit
                        </button>
                        <button type="button" className="staff-btn staff-btn--ghost staff-btn--sm" disabled={busyId === f.faqId} onClick={() => onDelete(f)}>
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

export type { FaqForm };
export default memo(FaqsComponent);
