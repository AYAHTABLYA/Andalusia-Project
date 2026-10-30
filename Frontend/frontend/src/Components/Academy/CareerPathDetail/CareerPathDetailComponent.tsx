import { Link } from "react-router-dom";
import Breadcrumb from "../Shared/Breadcrumb";
import type { CareerPathDetailDto } from "../../../Types/AcademyApi";
import { formatMoney } from "../../../utils/format";
import "./style.css";

type Props = {
  path: CareerPathDetailDto;
  onApply: () => void;
  onDownloadSyllabus: () => void;
  syllabusLoading: boolean;
  syllabusFeedback: { kind: "success" | "error"; text: string } | null;
};

const HIGHLIGHT_ICONS: Record<string, string> = {
  Duration: "schedule",
  "Target Seniority": "badge",
  Recognition: "verified",
  Facilities: "dns",
};

function CareerPathDetailComponent({ path, onApply, onDownloadSyllabus, syllabusLoading, syllabusFeedback }: Props) {
  const programs = [...path.programs].sort((a, b) => a.orderIndex - b.orderIndex);
  // The API omits highlight values that are null, so only show the ones that have data.
  const highlights = path.highlights.filter((h) => h.value);

  return (
    <div className="career-path-detail_box-1">
      <Breadcrumb bar items={[{ label: "Academic Home", to: "/" }, { label: "Career Paths", to: "/career-paths" }, { label: path.title }]} />

      <div className="career-path-detail_box-2">
        <div className="career-path-detail_box-3">
          <div className="career-path-detail_box-4">
            <div className="career-path-detail_box-5">
              <span className="career-path-detail_text-1">
                <span className="career-path-detail_text-2"></span>
                {path.status}
              </span>
              <span className="career-path-detail_text-3">
                <span className="career-path-detail_text-4 material-symbols-outlined">location_on</span>
                Alexandria Campus &amp; Hybrid Labs
              </span>
            </div>
            <div>
              <h1 className="career-path-detail_title-1">{path.title}</h1>
              <p className="career-path-detail_text-6">{path.summary}</p>
              {path.roles && (
                <p className="career-path-detail_roles">
                  <strong>Target Roles:</strong> {path.roles}
                </p>
              )}
            </div>

            {highlights.length > 0 && (
              <div className="career-path-detail_box-6">
                {highlights.map((h) => (
                  <div key={h.label} className="career-path-detail_box-7">
                    <div className={`career-path-detail_box-8 career-path-detail_tone--${h.tone}`.trim()}>
                      <span className="career-path-detail_text-7 material-symbols-outlined">
                        {HIGHLIGHT_ICONS[h.label] ?? "info"}
                      </span>
                    </div>
                    <div>
                      <div className="career-path-detail_box-9">{h.label}</div>
                      <div className="career-path-detail_box-10">{h.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="career-path-detail_box-14">
            <div className="career-path-detail_box-15">
              <div className="career-path-detail_box-16">
                <span className="career-path-detail_text-9">Executive Track</span>
              </div>
              <div className="career-path-detail_box-17">
                <div>
                  <span className="career-path-detail_text-11">Institutional Tuition Fee</span>
                  <div className="career-path-detail_box-18">
                    {formatMoney(path.tuition, path.currency)}
                    {path.duration && <span className="career-path-detail_text-12"> / {path.duration}</span>}
                  </div>
                  <p className="career-path-detail_text-13">Corporate sponsorship &amp; installment plans available through partner banks.</p>
                </div>
                <div className="career-path-detail_box-19">
                  <button type="button" onClick={onApply} className="career-path-detail_btn-1">
                    <span>Apply for Executive Path Interview</span>
                    <span className="career-path-detail_text-14 material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button type="button" onClick={onDownloadSyllabus} disabled={syllabusLoading} className="career-path-detail_btn-2">
                    <span className="career-path-detail_text-4 material-symbols-outlined">download</span>
                    <span>{syllabusLoading ? "Preparing…" : "Download Full Syllabus (PDF)"}</span>
                  </button>
                  {syllabusFeedback && (
                    <p
                      role={syllabusFeedback.kind === "error" ? "alert" : "status"}
                      className={`career-path-detail_feedback career-path-detail_feedback--${syllabusFeedback.kind}`}
                    >
                      {syllabusFeedback.text}
                    </p>
                  )}
                </div>
                {path.guarantees.length > 0 && (
                  <div className="career-path-detail_box-20">
                    <span className="career-path-detail_text-15">Executive Guarantees</span>
                    {path.guarantees.map((g) => (
                      <div key={g} className="career-path-detail_box-21">
                        <span className="career-path-detail_text-16 material-symbols-outlined">check_circle</span>
                        <span>{g}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="career-path-detail_box-22">
                  <div>
                    <span className="career-path-detail_text-17">Direct Admissions</span>
                    <strong className="career-path-detail_strong-1">+20 (3) 540-8910</strong>
                  </div>
                  <a href="tel:+2035408910" className="career-path-detail_link-1">Call Registrar ➔</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="career-path-detail_section-1">
          <div className="career-path-detail_box-23">
            <span className="career-path-detail_text-18">Taxonomy &amp; Roadmap</span>
            <h2 className="career-path-detail_title-2">Visual Progression Blueprint</h2>
          </div>
          <div className="career-path-detail_box-24">
            <div className="career-path-detail_box-25">
              <span className="career-path-detail_text-14 material-symbols-outlined">account_tree</span>
              CAREER PATH: {path.title}{path.duration ? ` (${path.duration})` : ""}
            </div>
            {programs.length === 0 && (
              <p className="career-path-detail_empty">Programs for this career path will be announced soon.</p>
            )}
            {programs.map((p, i) => (
              <div key={p.id} className={`career-path-detail_box-26 ${i === 0 ? "career-path-detail_box-26--on" : "career-path-detail_box-26--off"}`.trim()}>
                <div className="career-path-detail_box-27">
                  <span>INCLUDED PROGRAM {i + 1}: {p.title}</span>
                  <Link to={`/programs/${p.slug}`} className="career-path-detail_link-2">View ➔</Link>
                </div>
                <div className="career-path-detail_box-28">
                  {p.courses.map((c, j) => (
                    <div key={c.id}>
                      {j === p.courses.length - 1 ? "└──" : "├──"}{" "}
                      {c.link ? (
                        <Link to={c.link} className="career-path-detail_tree-link">{c.title}</Link>
                      ) : (
                        c.title
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {programs.length > 0 && (
          <section className="career-path-detail_section-2">
            <div>
              <span className="career-path-detail_text-18">Accredited Diploma Components</span>
              <h2 className="career-path-detail_title-3">Included Programs in this Career Path</h2>
            </div>
            <div className="career-path-detail_box-29">
              {programs.map((p, i) => (
                <div key={p.id} className="career-path-detail_box-30">
                  <div className="career-path-detail_box-31">
                    <div className="career-path-detail_box-32">
                      <span className={`career-path-detail_text-19 ${i % 2 === 1 ? "career-path-detail_text-19--on" : "career-path-detail_text-19--off"}`.trim()}>
                        Program {String(i + 1).padStart(2, "0")} of {String(programs.length).padStart(2, "0")}
                      </span>
                      <span className="career-path-detail_text-20">
                        {[p.duration, `${p.coursesCount} Courses`].filter(Boolean).join(" • ")}
                      </span>
                    </div>
                    <h3 className="career-path-detail_title-4">{p.title}</h3>
                    <p className="career-path-detail_text-21">{p.description}</p>
                    <div className="career-path-detail_box-33">
                      {p.courses.map((c) => <div key={c.id}>• {c.title}</div>)}
                    </div>
                  </div>
                  <div className="career-path-detail_box-34">
                    <div>
                      <span className="career-path-detail_text-22">Standalone Tuition</span>
                      <span className="career-path-detail_text-23">{formatMoney(p.tuition, p.currency)}</span>
                    </div>
                    <Link to={`/programs/${p.slug}`} className="career-path-detail_link-3">
                      <span>View Program Details</span>
                      <span className="career-path-detail_text-24 material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default CareerPathDetailComponent;
