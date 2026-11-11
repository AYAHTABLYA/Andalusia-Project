import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import FaqsComponent from "./FaqsComponent";
import type { FaqForm } from "./FaqsComponent";
import useApi from "../../../../hooks/academyHooks/useApi";
import { ApiError } from "../../../../apis/academyApi";
import { createFaq, deleteFaq, getAdminFaqs, updateFaq } from "../../../../apis/adminApi";
import type { AdminFaq, FaqBody } from "../../../../Types/Admin";

const EMPTY_FORM: FaqForm = { question: "", answer: "", orderIndex: "", categoryId: "", isActive: true };

const fromFaq = (faq: AdminFaq): FaqForm => ({
  question: faq.question,
  answer: faq.answer,
  orderIndex: String(faq.orderIndex),
  categoryId: faq.categoryId ? String(faq.categoryId) : "",
  isActive: faq.isActive ?? true,
});

// Blank order -> null, so the API puts it at the end of its category (create) or keeps it (update).
// When editing, an unchanged category keeps its order; a changed one is sent as null to avoid a clash.
const toBody = (form: FaqForm, original?: AdminFaq): FaqBody => {
  const categoryId = form.categoryId ? Number(form.categoryId) : null;
  const categoryChanged = !!original && (original.categoryId ?? null) !== categoryId;
  const hasOrder = form.orderIndex.trim() !== "" && !categoryChanged;
  return {
    question: form.question.trim(),
    answer: form.answer.trim(),
    orderIndex: hasOrder ? Number(form.orderIndex) : null,
    categoryId,
    isActive: form.isActive,
  };
};

function FaqsContainer() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FaqForm>(EMPTY_FORM);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const faqs = useApi((signal) => getAdminFaqs(signal), []);

  const fail = (error: unknown) =>
    setMessage({
      type: "error",
      text: error instanceof ApiError ? error.message : "The request failed. Please try again.",
    });

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...(faqs.data ?? [])]
      .sort((a, b) => a.orderIndex - b.orderIndex || a.faqId - b.faqId)
      .filter((f) => !term || `${f.question} ${f.answer} ${f.categoryName ?? ""}`.toLowerCase().includes(term));
  }, [faqs.data, search]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleToggleForm = () => {
    if (showForm) return closeForm();
    // Blank display order = the API appends the FAQ to the end of its category.
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMessage(null);
  };

  const handleEdit = (faq: AdminFaq) => {
    setEditingId(faq.faqId);
    setForm(fromFaq(faq));
    setShowForm(true);
    setMessage(null);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const next = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const original = editingId !== null ? faqs.data?.find((f) => f.faqId === editingId) : undefined;
      const body = toBody(form, original);
      if (editingId !== null) await updateFaq(editingId, body);
      else await createFaq(body);
      setMessage({ type: "success", text: editingId !== null ? "FAQ updated." : "FAQ created." });
      closeForm();
      faqs.reload();
    } catch (error) {
      fail(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faq: AdminFaq) => {
    if (!window.confirm(`Delete this FAQ?\n\n“${faq.question}”`)) return;
    setBusyId(faq.faqId);
    setMessage(null);
    try {
      await deleteFaq(faq.faqId);
      setMessage({ type: "success", text: "FAQ deleted." });
      if (editingId === faq.faqId) closeForm();
      faqs.reload();
    } catch (error) {
      fail(error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <FaqsComponent
      items={items}
      total={faqs.data?.length ?? 0}
      loading={faqs.loading}
      errorMessage={faqs.error?.message}
      message={message}
      search={search}
      showForm={showForm}
      editingId={editingId}
      form={form}
      saving={saving}
      busyId={busyId}
      onSearch={(e) => setSearch(e.target.value)}
      onToggleForm={handleToggleForm}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCancel={closeForm}
      onRetry={faqs.reload}
    />
  );
}

export default FaqsContainer;
