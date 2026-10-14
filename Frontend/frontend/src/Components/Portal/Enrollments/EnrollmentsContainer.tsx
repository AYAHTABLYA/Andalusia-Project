import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../apis/academyApi";
import { getMyEnrollments, type EnrollmentDto } from "../../../apis/portalRecordsApi";
import "../Applications/style.css";

export default function EnrollmentsContainer() {
  const [items, setItems] = useState<EnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getMyEnrollments().then(data => { if (active) setItems(data); })
      .catch((e: unknown) => { if (active) setError(e instanceof ApiError ? e.message : "Could not load your enrollments."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <section className="portal-workspace applications-page">
    <nav className="portal-crumb"><Link to="/profile">Learner portal</Link><span>›</span><span>My enrollments</span></nav>
    <header className="portal-page-heading"><div><span className="portal-eyebrow">YOUR ACADEMIC JOURNEY</span><h1>My Enrollments</h1><p>View your confirmed course and program registrations.</p></div></header>
    {loading && <div className="portal-card"><p>Loading your enrollments…</p></div>}
    {!loading && error && <div className="portal-card application-empty"><h2>Could not load enrollments</h2><p>{error}</p><button className="portal-btn portal-btn-secondary" onClick={() => window.location.reload()}>Try again</button></div>}
    {!loading && !error && items.length === 0 && <div className="portal-card application-empty"><span className="material-symbols-outlined">school</span><h2>No enrollments yet</h2><p>Your course or program registrations will appear here once they are recorded.</p><Link className="portal-btn portal-btn-primary" to="/courses">Explore courses</Link></div>}
    {!loading && !error && items.map(item => <article className="portal-card application-card" key={item.id}>
      <div className="application-card-top"><span className="application-id">{`Enrollment #${item.id}`}</span><span className="portal-status status-review">{item.status.replaceAll("_", " ")}</span></div>
      <h2>{item.courseTitle ?? item.programTitle ?? (item.courseId ? `Course #${item.courseId}` : `Program #${item.programId}`)}</h2>
      <p className="application-track">{`Enrolled on ${new Date(item.enrolledAt).toLocaleDateString()}`}</p>
      <div className="application-meta"><span>{`Schedule: ${item.scheduleId ?? "Not assigned"}`}</span>{item.applicationId && <span>{`Application #${item.applicationId}`}</span>}</div>
      <div className="application-card-bottom"><p><strong>Enrollment ID:</strong> {item.id}</p><Link className="portal-btn portal-btn-secondary" to={`/enrollments/${item.id}`}>View details →</Link></div>
    </article>)}
  </section>;
}
