import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import TestimonialsComponent from "./TestimonialsComponent";
import type { TestimonialForm } from "./TestimonialsComponent";
import useApi from "../../../../hooks/academyHooks/useApi";
import { ApiError } from "../../../../apis/academyApi";
import {
  createTestimonial,
  deleteTestimonial,
  getAdminTestimonials,
  updateTestimonial,
} from "../../../../apis/adminApi";
import type { AdminTestimonial, TestimonialBody } from "../../../../Types/Admin";

const EMPTY_FORM: TestimonialForm = {
  clientName: "",
  titleOrRole: "",
  quoteText: "",
  avatarUrl: "",
  rating: "5",
  isFeatured: true,
  courseId: "",
};

const fromTestimonial = (t: AdminTestimonial): TestimonialForm => ({
  clientName: t.clientName,
  titleOrRole: t.titleOrRole,
  quoteText: t.quoteText,
  avatarUrl: t.avatarUrl ?? "",
  rating: String(t.rating),
  isFeatured: t.isFeatured,
  courseId: t.courseId ? String(t.courseId) : "",
});

const toBody = (f: TestimonialForm): TestimonialBody => ({
  clientName: f.clientName.trim(),
  titleOrRole: f.titleOrRole.trim(),
  quoteText: f.quoteText.trim(),
  avatarUrl: f.avatarUrl.trim() || null,
  rating: Number(f.rating),
  isFeatured: f.isFeatured,
  courseId: f.courseId ? Number(f.courseId) : null,
});

function TestimonialsContainer() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TestimonialForm>(EMPTY_FORM);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const testimonials = useApi((signal) => getAdminTestimonials(signal), []);

  const fail = (error: unknown) =>
    setMessage({
      type: "error",
      text: error instanceof ApiError ? error.message : "The request failed. Please try again.",
    });

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...(testimonials.data ?? [])]
      .sort((a, b) => b.testimonialId - a.testimonialId)
      .filter(
        (t) =>
          !term ||
          `${t.clientName} ${t.titleOrRole} ${t.quoteText} ${t.courseTitle ?? ""}`.toLowerCase().includes(term),
      );
  }, [testimonials.data, search]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleToggleForm = () => {
    if (showForm) return closeForm();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMessage(null);
  };

  const handleEdit = (t: AdminTestimonial) => {
    setEditingId(t.testimonialId);
    setForm(fromTestimonial(t));
    setShowForm(true);
    setMessage(null);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const next = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body = toBody(form);
      if (editingId !== null) await updateTestimonial(editingId, body);
      else await createTestimonial(body);
      setMessage({ type: "success", text: editingId !== null ? "Testimonial updated." : "Testimonial created." });
      closeForm();
      testimonials.reload();
    } catch (error) {
      fail(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: AdminTestimonial) => {
    if (!window.confirm(`Delete the testimonial from ${t.clientName}?`)) return;
    setBusyId(t.testimonialId);
    setMessage(null);
    try {
      await deleteTestimonial(t.testimonialId);
      setMessage({ type: "success", text: "Testimonial deleted." });
      if (editingId === t.testimonialId) closeForm();
      testimonials.reload();
    } catch (error) {
      fail(error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <TestimonialsComponent
      items={items}
      total={testimonials.data?.length ?? 0}
      loading={testimonials.loading}
      errorMessage={testimonials.error?.message}
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
      onRetry={testimonials.reload}
    />
  );
}

export default TestimonialsContainer;
