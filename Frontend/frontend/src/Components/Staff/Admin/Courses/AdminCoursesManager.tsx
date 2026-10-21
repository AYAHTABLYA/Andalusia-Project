import { useCallback, useEffect, useState, type FormEvent } from 'react';
import '../../style.css';
import {
  createAdminCourse, deleteAdminCourse, getAdminCourses, getAdminCourseMentors, updateAdminCourse,
  type AdminCourseBody, type AdminCourseDto, type AdminCourseMentorDto,
} from '../../../../apis/staffAdminApi';

type CourseForm = {
  title: string; description: string; category: string; deliveryMode: string; hall: string;
  durationLabel: string; level: string; accreditation: string; tuition: string; tuitionNote: string;
  isFeatured: boolean; mentorId: string; programId: string; careerPathId: string;
};
const emptyForm: CourseForm = {
  title: '', description: '', category: '', deliveryMode: 'Offline (Alex Campus)',
  hall: 'Hall B-302, Alexandria Campus', durationLabel: '', level: 'Executive Advanced',
  accreditation: 'Pearson & CPD', tuition: '0', tuitionNote: '', isFeatured: false,
  mentorId: '', programId: '', careerPathId: '',
};
const fromCourse = (c: AdminCourseDto): CourseForm => ({
  title: c.title, description: c.description, category: c.category, deliveryMode: c.deliveryMode,
  hall: c.hall, durationLabel: c.durationLabel, level: c.level, accreditation: c.accreditation,
  tuition: String(c.tuition), tuitionNote: c.tuitionNote, isFeatured: c.isFeatured,
  mentorId: String(c.mentorId), programId: c.programId ? String(c.programId) : '',
  careerPathId: c.careerPathId ? String(c.careerPathId) : '',
});
const toBody = (f: CourseForm): AdminCourseBody => ({
  title: f.title.trim(), description: f.description.trim(), category: f.category.trim(),
  deliveryMode: f.deliveryMode.trim(), hall: f.hall.trim(), durationLabel: f.durationLabel.trim(),
  level: f.level.trim(), accreditation: f.accreditation.trim(), tuition: Number(f.tuition),
  tuitionNote: f.tuitionNote.trim(), isFeatured: f.isFeatured, mentorId: Number(f.mentorId),
  programId: f.programId ? Number(f.programId) : null,
  careerPathId: f.careerPathId ? Number(f.careerPathId) : null,
});

export default function AdminCoursesManager() {
  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [mentors, setMentors] = useState<AdminCourseMentorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<AdminCourseDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CourseForm>(emptyForm);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const [courseRows, mentorRows] = await Promise.all([getAdminCourses(signal), getAdminCourseMentors(signal)]);
      if (signal?.aborted) return;
      setCourses(courseRows); setMentors(mentorRows);
    } catch (e) {
      if (!signal?.aborted) setError(e instanceof Error ? e.message : 'Could not load courses.');
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const startCreate = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); setNotice(''); setError(''); };
  const startEdit = (course: AdminCourseDto) => { setEditing(course); setForm(fromCourse(course)); setFormOpen(true); setNotice(''); setError(''); };
  const updateField = <K extends keyof CourseForm>(key: K, value: CourseForm[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const body = toBody(form);
      if (!body.mentorId || !Number.isFinite(body.tuition) || body.tuition < 0) {
        setError('Choose a mentor and enter a valid non-negative tuition amount.'); return;
      }
      if (editing) await updateAdminCourse(editing.courseId, body);
      else await createAdminCourse(body);
      setNotice(editing ? 'Course updated successfully.' : 'Course created successfully.');
      setFormOpen(false); setEditing(null); setForm(emptyForm); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save course.'); }
    finally { setSaving(false); }
  };

  const remove = async (course: AdminCourseDto) => {
    if (!window.confirm(`Delete “${course.title}”? Courses linked to schedules, applications or programs cannot be deleted.`)) return;
    setError(''); setNotice('');
    try { await deleteAdminCourse(course.courseId); setCourses(rows => rows.filter(row => row.courseId !== course.courseId)); setNotice(`“${course.title}” deleted.`); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not delete course.'); }
  };

  const visibleCourses = courses.filter(c => `${c.title} ${c.slug} ${c.category} ${c.mentorName}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="staff-dashboard staff-workspace-page admin-courses-manager">
    <header className="staff-page_head"><div><div className="staff-eyebrow">ACADEMY OPERATIONS</div><h1 className="staff-page_title">Course management</h1><p className="staff-page_sub">Create and maintain the course catalog. Course creation is restricted to Admin accounts.</p></div><button className="staff-workspace-primary" onClick={startCreate}><span className="material-symbols-outlined">add</span>Create course</button></header>
    <section className="staff-workspace-stats"><article className="staff-workspace-stat"><span className="material-symbols-outlined">menu_book</span><small>Total courses</small><strong>{courses.length}</strong><em>Live catalog</em></article><article className="staff-workspace-stat"><span className="material-symbols-outlined">star</span><small>Featured</small><strong>{courses.filter(c => c.isFeatured).length}</strong><em>Featured catalog entries</em></article><article className="staff-workspace-stat"><span className="material-symbols-outlined">category</span><small>Categories</small><strong>{new Set(courses.map(c => c.category)).size}</strong><em>Distinct categories</em></article></section>
    {notice && <p className="staff-workspace-notice" role="status">{notice}</p>}{error && <p className="staff-workspace-notice" role="alert">{error}</p>}
    {formOpen && <section className="staff-card staff-course-form-card"><div className="staff-card_head"><div><h2>{editing ? 'Edit course' : 'Create course'}</h2><p className="staff-page_sub">Required fields are marked in the form. The slug is generated by the backend.</p></div><button className="staff-workspace-secondary" type="button" onClick={() => setFormOpen(false)}>Close</button></div>
      <form className="staff-course-form" onSubmit={submit}>
        <label>Course title<input required minLength={2} maxLength={160} value={form.title} onChange={e => updateField('title', e.target.value)} /></label>
        <label>Category<input required maxLength={100} value={form.category} onChange={e => updateField('category', e.target.value)} /></label>
        <label>Duration label<input required value={form.durationLabel} onChange={e => updateField('durationLabel', e.target.value)} placeholder="e.g. 8 weeks" /></label>
        <label>Mentor<select required value={form.mentorId} onChange={e => updateField('mentorId', e.target.value)}><option value="">Choose mentor</option>{mentors.map(m => <option key={m.id} value={m.id}>{m.name}{m.title ? ` — ${m.title}` : ''}</option>)}</select></label>
        <label>Delivery mode<input required value={form.deliveryMode} onChange={e => updateField('deliveryMode', e.target.value)} /></label>
        <label>Hall / location<input required value={form.hall} onChange={e => updateField('hall', e.target.value)} /></label>
        <label>Level<input required value={form.level} onChange={e => updateField('level', e.target.value)} /></label>
        <label>Accreditation<input required value={form.accreditation} onChange={e => updateField('accreditation', e.target.value)} /></label>
        <label>Tuition (EGP)<input required type="number" min="0" step="0.01" value={form.tuition} onChange={e => updateField('tuition', e.target.value)} /></label>
        <label>Program ID (optional)<input type="number" min="1" value={form.programId} onChange={e => updateField('programId', e.target.value)} /></label>
        <label>Career path ID (optional)<input type="number" min="1" value={form.careerPathId} onChange={e => updateField('careerPathId', e.target.value)} /></label>
        <label className="staff-course-form-wide">Tuition note<input maxLength={500} value={form.tuitionNote} onChange={e => updateField('tuitionNote', e.target.value)} /></label>
        <label className="staff-course-form-wide">Description<textarea required minLength={10} maxLength={4000} rows={4} value={form.description} onChange={e => updateField('description', e.target.value)} /></label>
        <label className="staff-course-featured"><input type="checkbox" checked={form.isFeatured} onChange={e => updateField('isFeatured', e.target.checked)} /> Show as featured course</label>
        {!mentors.length && <p className="staff-course-form-wide staff-course-help">No mentors were returned by the API. Add a Mentor record first, then reload this page.</p>}
        <div className="staff-course-form-actions"><button className="staff-workspace-primary" type="submit" disabled={saving || !mentors.length}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create course'}</button><button className="staff-workspace-secondary" type="button" disabled={saving} onClick={() => setFormOpen(false)}>Cancel</button></div>
      </form>
    </section>}
    <section className="staff-card staff-workspace-table-card"><div className="staff-card_head"><div><h2>Course register</h2><p className="staff-page_sub">Search and manage catalog entries. Existing course details and slugs are preserved when editing.</p></div><span className="material-symbols-outlined staff-workspace-card-icon">menu_book</span></div>
      <div className="staff-toolbar"><input className="staff-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses, categories, mentors…" aria-label="Search courses" /><button className="staff-workspace-secondary" onClick={() => setSearch('')}>Reset</button><button className="staff-workspace-secondary" onClick={() => void load()}>Refresh</button></div>
      {loading && <p className="staff-workspace-notice" role="status">Loading courses…</p>}
      <div className="staff-table-wrap"><table className="staff-table"><thead><tr><th>Course</th><th>Category</th><th>Mentor</th><th>Duration</th><th>Tuition</th><th>Featured</th><th>Actions</th></tr></thead><tbody>
        {visibleCourses.map(c => <tr key={c.courseId}><td><strong>{c.title}</strong><small className="staff-course-slug">{c.slug}</small></td><td>{c.category}</td><td>{c.mentorName || `Mentor #${c.mentorId}`}</td><td>{c.durationLabel}</td><td>{c.tuition.toLocaleString()} EGP</td><td>{c.isFeatured ? 'Yes' : 'No'}</td><td><span className="staff-row-actions"><button className="staff-workspace-secondary" onClick={() => startEdit(c)}>Edit</button><button className="staff-workspace-secondary" onClick={() => void remove(c)}>Delete</button></span></td></tr>)}
        {!visibleCourses.length && !loading && <tr><td colSpan={7}><div className="staff-workspace-empty"><span className="material-symbols-outlined">menu_book</span><strong>{search ? 'No matching courses' : 'No courses found'}</strong><p>Create a course or refresh to load the latest catalog records.</p></div></td></tr>}
      </tbody></table></div>
    </section>
  </div>;
}
