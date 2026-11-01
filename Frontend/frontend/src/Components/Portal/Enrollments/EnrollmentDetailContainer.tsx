import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../apis/academyApi";
import { getMyEnrollment, type EnrollmentDto } from "../../../apis/portalRecordsApi";
import "../Applications/style.css";

export default function EnrollmentDetailContainer() {
  const { id } = useParams();
  const [item, setItem] = useState<EnrollmentDto | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) { setError("Invalid enrollment ID."); return; }
    getMyEnrollment(Number(id)).then(setItem).catch((e: unknown) => setError(e instanceof ApiError ? e.message : "Could not load enrollment."));
  }, [id]);
  return <section className="portal-workspace applications-page"><nav className="portal-crumb"><Link to="/enrollments">My enrollments</Link><span>›</span><span>Details</span></nav>
    <header className="portal-page-heading"><div><span className="portal-eyebrow">ENROLLMENT DETAILS</span><h1>{id ? `Enrollment #${id}` : "Enrollment"}</h1></div></header>
    {error && <div className="portal-card"><p>{error}</p></div>}
    {item && <article className="portal-card application-card"><h2>{item.courseTitle ?? item.programTitle ?? "Enrollment"}</h2><p>{`Status: ${item.status.replaceAll("_", " ")}`}</p><p>{`Enrollment date: ${new Date(item.enrolledAt).toLocaleString()}`}</p><p>{`Schedule ID: ${item.scheduleId ?? "Not assigned"}`}</p><p>{`Related application: ${item.applicationId ?? "None"}`}</p></article>}
  </section>;
}
