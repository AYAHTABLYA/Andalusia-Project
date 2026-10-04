import { Link } from "react-router-dom";
import Breadcrumb from "../Shared/Breadcrumb";
import { GUARANTEES, HIGHLIGHTS, PATH_PROGRAMS } from "./constants";
import "./style.css";

function CareerPathDetailComponent() {
  return (
    <div className="career-path-detail_box-1">
      <Breadcrumb bar items={[{ label: "Academic Home", to: "/" }, { label: "Career Paths", to: "/career-paths" }, { label: "Executive FinTech & Cloud Architecture" }]} />

      <div className="career-path-detail_box-2">
        <div className="career-path-detail_box-3">
          <div className="career-path-detail_box-4">
            <div className="career-path-detail_box-5">
              <span className="career-path-detail_text-1">
                <span className="career-path-detail_text-2"></span>
                Enrolling (Spring 2025) • 12 Executive Seats Reserved
              </span>
              <span className="career-path-detail_text-3">
                <span className="career-path-detail_text-4 material-symbols-outlined">location_on</span>
                Alexandria Campus &amp; Hybrid Labs
              </span>
            </div>
            <div>
              <h1 className="career-path-detail_title-1">
                Executive FinTech &amp; <span className="career-path-detail_text-5">Cloud Architecture</span> Career Path
              </h1>
              <p className="career-path-detail_text-6">
                A premier 10-month executive trajectory transforming senior software architects and technology leaders into enterprise FinTech Chief Architects. Complete 2 accredited postgraduate diplomas, 8 specialized technical modules, and defend your mock digital bank before an executive board.
              </p>
            </div>

            <div className="career-path-detail_box-6">
              {HIGHLIGHTS.map((h) => (
                <div key={h.label} className="career-path-detail_box-7">
                  <div className={`career-path-detail_box-8 career-path-detail_tone--${h.tone}`.trim()}>
                    <span className="career-path-detail_text-7 material-symbols-outlined">{h.icon}</span>
                  </div>
                  <div>
                    <div className="career-path-detail_box-9">{h.label}</div>
                    <div className="career-path-detail_box-10">{h.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="career-path-detail_box-11">
              <div className="career-path-detail_box-12">HE</div>
              <div>
                <p className="career-path-detail_text-8">
                  "This career path is not a conventional course series. It is a rigorous defense-grade engineering foundry designed to construct leaders capable of architecting sovereign monetary infrastructure."
                </p>
                <div className="career-path-detail_box-13">Prof. Hesham El-Sayed, Ph.D. — Dean of Postgraduate Technology</div>
              </div>
            </div>
          </div>

          <div className="career-path-detail_box-14">
            <div className="career-path-detail_box-15">
              <div className="career-path-detail_box-16">
                <span className="career-path-detail_text-9">Executive Track</span>
                <span className="career-path-detail_text-10">Strict Cap: 16 Fellows</span>
              </div>
              <div className="career-path-detail_box-17">
                <div>
                  <span className="career-path-detail_text-11">Institutional Tuition Fee</span>
                  <div className="career-path-detail_box-18">EGP 68,000 <span className="career-path-detail_text-12">/ 10 Months</span></div>
                  <p className="career-path-detail_text-13">Corporate sponsorship &amp; 0% installments via CIB, Banque Misr &amp; QNB.</p>
                </div>
                <div className="career-path-detail_box-19">
                  <button onClick={() => alert("Application interview form opened. Our academic director will contact you within 24 hours.")} className="career-path-detail_btn-1">
                    <span>Apply for Executive Path Interview</span>
                    <span className="career-path-detail_text-14 material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button onClick={() => alert("Downloading FinTech Career Path Full Syllabus (PDF)...")} className="career-path-detail_btn-2">
                    <span className="career-path-detail_text-4 material-symbols-outlined">download</span>
                    <span>Download Full Syllabus (PDF)</span>
                  </button>
                </div>
                <div className="career-path-detail_box-20">
                  <span className="career-path-detail_text-15">Executive Guarantees</span>
                  {GUARANTEES.map((g) => (
                    <div key={g} className="career-path-detail_box-21">
                      <span className="career-path-detail_text-16 material-symbols-outlined">check_circle</span>
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
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
              CAREER PATH: Executive FinTech &amp; Cloud Architecture (10 Months / 24 ECTS)
            </div>
            {PATH_PROGRAMS.map((p, i) => (
              <div key={p.badge} className={`career-path-detail_box-26 ${i === 0 ? "career-path-detail_box-26--on" : "career-path-detail_box-26--off"}`.trim()}>
                <div className="career-path-detail_box-27">
                  <span>INCLUDED PROGRAM {i + 1}: {p.title}</span>
                  <Link to={p.to} className="career-path-detail_link-2">View ➔</Link>
                </div>
                <div className="career-path-detail_box-28">
                  {p.courses.map((c, j) => (
                    <div key={c}>{j === p.courses.length - 1 ? "└──" : "├──"} {c}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="career-path-detail_section-2">
          <div>
            <span className="career-path-detail_text-18">Accredited Diploma Components</span>
            <h2 className="career-path-detail_title-3">Included Programs in this Career Path</h2>
          </div>
          <div className="career-path-detail_box-29">
            {PATH_PROGRAMS.map((p) => (
              <div key={p.badge} className="career-path-detail_box-30">
                <div className="career-path-detail_box-31">
                  <div className="career-path-detail_box-32">
                    <span className={`career-path-detail_text-19 ${p.dark ? "career-path-detail_text-19--on" : "career-path-detail_text-19--off"}`.trim()}>{p.badge}</span>
                    <span className="career-path-detail_text-20">{p.meta}</span>
                  </div>
                  <h3 className="career-path-detail_title-4">{p.title}</h3>
                  <p className="career-path-detail_text-21">{p.text}</p>
                  <div className="career-path-detail_box-33">
                    {p.courses.map((c) => <div key={c}>• {c}</div>)}
                  </div>
                </div>
                <div className="career-path-detail_box-34">
                  <div>
                    <span className="career-path-detail_text-22">Standalone Tuition</span>
                    <span className="career-path-detail_text-23">{p.tuition}</span>
                  </div>
                  <Link to={p.to} className="career-path-detail_link-3">
                    <span>{p.cta}</span>
                    <span className="career-path-detail_text-24 material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CareerPathDetailComponent;
