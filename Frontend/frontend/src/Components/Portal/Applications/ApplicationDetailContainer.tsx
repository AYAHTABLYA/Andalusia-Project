import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../apis/academyApi";
import { getMyApplication, type ApplicationDto } from "../../../apis/portalRecordsApi";
import "./style.css";
export default function ApplicationDetailContainer() {
 const { id } = useParams(); const [item,setItem] = useState<ApplicationDto | null>(null); const [error,setError] = useState("");
 useEffect(() => { if (!id || !/^\d+$/.test(id)) { setError("Invalid application ID."); return; } getMyApplication(Number(id)).then(setItem).catch((e: unknown) => setError(e instanceof ApiError ? e.message : "Could not load application.")); },[id]);
 const title = item?.courseTitle ?? item?.programTitle ?? "Application";
 return <section className="portal-workspace applications-page"><nav className="portal-crumb"><Link to="/applications">My applications</Link><span>›</span><span>Details</span></nav><header className="portal-page-heading"><div><span className="portal-eyebrow">APPLICATION DETAILS</span><h1>{id ? `Application #${id}` : "Application"}</h1></div></header>{error && <div className="portal-card"><p>{error}</p></div>}{item && <article className="portal-card application-card"><h2>{title}</h2><p>{`Status: ${item.status.replaceAll("_"," ")}`}</p><p>{`Submitted: ${new Date(item.submissionDate).toLocaleString()}`}</p><p>{`Course ID: ${item.courseId ?? "—"}`}</p><p>{`Program ID: ${item.programId ?? "—"}`}</p><p>{`Schedule ID: ${item.scheduleId ?? "Not assigned"}`}</p></article>}</section>;
}
