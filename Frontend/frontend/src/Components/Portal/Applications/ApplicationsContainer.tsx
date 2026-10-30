import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../../apis/academyApi";
import { cancelMyApplication, getMyApplications, type ApplicationDto } from "../../../apis/portalRecordsApi";
import "./style.css";

const FILTERS = [
  { value: "all", label: "All applications" },
  { value: "Submitted", label: "Submitted" },
  { value: "Cancelled", label: "Cancelled" },
];
const labelStatus = (status: string) => status.replaceAll("_", " ");
const titleFor = (app: ApplicationDto) => app.courseTitle ?? app.programTitle ?? (app.courseId ? `Course #${app.courseId}` : `Program #${app.programId}`);
export default function ApplicationsContainer() {
  const [items, setItems] = useState<ApplicationDto[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const navigate = useNavigate();
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await getMyApplications()); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Could not load your applications."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => items.filter(a =>
    (filter === "all" || a.status === filter) &&
    `${titleFor(a)} ${a.id} ${a.status}`.toLowerCase().includes(search.toLowerCase())
  ), [items, filter, search]);
  const cancel = async (app: ApplicationDto) => {
    const ar = document.documentElement.lang === "ar";
    if (!window.confirm(ar ? `هل تريد إلغاء الطلب رقم ${app.id}؟ لا يمكن التراجع عن هذا الإجراء.` : `Cancel application #${app.id}? This action cannot be undone.`)) return;
    setBusyId(app.id); setError("");
    try { await cancelMyApplication(app.id); await load(); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Could not cancel this application."); }
    finally { setBusyId(null); }
  };
  const count = (status: string) => items.filter(a => a.status === status).length;
  return <section className="portal-workspace applications-page">
    <nav className="portal-crumb"><Link to="/profile">Learner portal</Link><span>›</span><span>My applications</span></nav>
    <header className="portal-page-heading"><div><span className="portal-eyebrow">YOUR ACADEMIC JOURNEY</span><h1>My Applications</h1><p>Track your submissions, review decisions, and manage your applications.</p></div><button className="portal-btn portal-btn-primary" onClick={() => navigate("/career-paths")}>＋ Explore programs</button></header>
    <div className="portal-stat-grid">
      <article className="portal-stat"><span>Total applications</span><strong>{items.length}</strong><small>Your submitted requests</small></article>
      <article className="portal-stat"><span>Submitted</span><strong>{count("Submitted")}</strong><small>In the application queue</small></article>
      <article className="portal-stat"><span>Cancelled</span><strong>{count("Cancelled")}</strong><small>No longer active</small></article>
    </div>
    {error && <div className="portal-card" role="alert"><p>{error}</p><button className="portal-btn portal-btn-secondary" onClick={() => void load()}>Retry</button></div>}
    <div className="portal-card application-toolbar"><div className="application-filters">{FILTERS.map(f => <button key={f.value} className={`portal-filter ${filter === f.value ? "is-active" : ""}`} onClick={() => setFilter(f.value)}>{f.label}</button>)}</div><label className="portal-search"><span className="material-symbols-outlined">search</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications" aria-label="Search applications" /></label></div>
    {loading && <div className="portal-card"><p>Loading your applications…</p></div>}
    {!loading && filtered.length === 0 && <div className="portal-card application-empty"><span className="material-symbols-outlined">search_off</span><h2>{items.length ? "No applications found" : "No applications yet"}</h2><p>{items.length ? "Try another search term or filter." : "Your submitted applications will appear here."}</p>{items.length > 0 && <button className="portal-btn portal-btn-secondary" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</button>}</div>}
    {!loading && <div className="application-list">{filtered.map(app => <article className="portal-card application-card" key={app.id}>
      <div className="application-card-top"><div><span className="application-id">APP-{app.id}</span><span className={`portal-status status-${app.status.toLowerCase()}`}>{labelStatus(app.status)}</span></div><span className="application-date">{new Date(app.submissionDate).toLocaleDateString()}</span></div>
      <h2>{titleFor(app)}</h2><p className="application-track">{app.courseId ? "Course application" : "Program application"}</p>
      <div className="application-meta"><span><span className="material-symbols-outlined">calendar_month</span>{`Submitted ${new Date(app.submissionDate).toLocaleDateString()}`}</span><span>{`Schedule: ${app.scheduleId ?? "Not assigned"}`}</span></div>
      <div className="application-card-bottom"><p><strong>Status:</strong> {labelStatus(app.status)}</p><div className="enrollment-actions"><button className="portal-btn portal-btn-secondary" onClick={() => navigate(`/applications/${app.id}`)}>View details →</button>{app.status !== "Cancelled" && <button className="portal-btn portal-btn-secondary" disabled={busyId === app.id} onClick={() => void cancel(app)}>{busyId === app.id ? "Cancelling…" : "Cancel application"}</button>}</div></div>
    </article>)}</div>}
  </section>;
}
