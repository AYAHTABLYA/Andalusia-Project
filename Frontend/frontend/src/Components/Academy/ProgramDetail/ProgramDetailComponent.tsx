import { Link } from "react-router-dom";
import Breadcrumb from "../Shared/Breadcrumb";
import StatGrid from "../Shared/StatGrid";
import EnrollCard from "../Shared/EnrollCard";
import { PROGRAM_BULLETS, PROGRAM_MODULES, PROGRAM_STATS } from "./constants";
import "./style.css";

function ProgramDetailComponent() {
  return (
    <div className="program-detail_box-1">
      <Breadcrumb
        bar
        items={[
          { label: "Academic Home", to: "/" },
          { label: "Programs", to: "/programs" },
          { label: "Certified Digital Banking Architect" },
        ]}
      />

      <div className="program-detail_box-2">
        <div className="program-detail_box-3">
          <div className="program-detail_box-4">
            <div className="program-detail_box-5">
              <span className="program-detail_text-1">
                Enrolling (4 Seats Left)
              </span>
              <span className="program-detail_text-2">
                Alexandria Campus Offline Cohort
              </span>
            </div>
            <h1 className="program-detail_title-1">
              Certified Digital Banking Architect &amp; Open Finance Program
            </h1>
            <p className="program-detail_text-3">
              A premier executive diploma engineered for senior software
              architects, fintech leads, and banking technology directors.
              Master core ledger microservices, high-throughput message queues,
              and CBE-compliant regulatory sandboxes over 24 intensive weeks.
            </p>
            <StatGrid items={PROGRAM_STATS} />
          </div>

          <section className="program-detail_section-1">
            <h2 className="program-detail_title-2">
              <span className="program-detail_text-4 material-symbols-outlined">
                menu_book
              </span>
              Included Courses in Sequence
            </h2>
            {PROGRAM_MODULES.map((m, i) => (
              <div key={m.no} className="program-detail_box-6">
                <div className="program-detail_box-7">
                  <span
                    className={`program-detail_text-5 ${i === 0 ? "program-detail_text-5--on" : "program-detail_text-5--off"}`.trim()}
                  >
                    {m.no}
                  </span>
                  <div>
                    <span className="program-detail_text-6">
                      Module {m.no} • {m.range}
                    </span>
                    <h3 className="program-detail_title-3">
                      {m.link ? (
                        <Link to={m.link} className="program-detail_link-1">
                          {m.title}
                        </Link>
                      ) : (
                        m.title
                      )}
                    </h3>
                    <p className="program-detail_text-7">{m.text}</p>
                  </div>
                </div>
                {m.link && (
                  <Link to={m.link} className="program-detail_link-2">
                    <span>View Course</span>
                    <span className="program-detail_text-8 material-symbols-outlined">
                      arrow_forward
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </section>
        </div>

        <EnrollCard
          label="Tuition & Exam Fees"
          price="EGP 48,000"
          note="Corporate sponsorships & 3-installment interest-free plans available."
          primaryText="Apply for Program Admission"
          primaryMsg="Application started for Certified Digital Banking Architect."
          secondaryText="Download Program Syllabus"
          secondaryMsg="Downloading Program Syllabus PDF..."
          bullets={PROGRAM_BULLETS}
        />
      </div>
    </div>
  );
}

export default ProgramDetailComponent;
