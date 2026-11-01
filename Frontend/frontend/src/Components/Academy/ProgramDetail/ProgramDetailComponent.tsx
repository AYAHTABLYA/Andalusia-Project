import { Link } from "react-router-dom";
import Breadcrumb from "../Shared/Breadcrumb";
import StatGrid from "../Shared/StatGrid";
import EnrollCard from "../Shared/EnrollCard";
import type { ProgramDetailDto } from "../../../Types/AcademyApi";
import { formatMoney } from "../../../utils/format";
import "./Style.css";

type Props = {
  program: ProgramDetailDto;
  onApply: () => void;
  onDownloadSyllabus: () => void;
  syllabusLoading: boolean;
  syllabusFeedback: { kind: "success" | "error"; text: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  Active: "Enrolling",
};

function ProgramDetailComponent({ program, onApply, onDownloadSyllabus, syllabusLoading, syllabusFeedback }: Props) {
  const stats = [
    { label: "Duration", value: program.stats.duration },
    { label: "Level", value: program.stats.level ?? "" },
    { label: "Accreditation", value: program.stats.accreditation },
    { label: "Campus", value: program.stats.campus ?? "" },
  ].filter((s) => s.value);

  const courses = [...program.courses].sort((a, b) => a.orderIndex - b.orderIndex);
  const hasRelated = !!program.careerPath || program.relatedPrograms.length > 0;

  return (
    <div className="program-detail_box-1">
      <Breadcrumb
        bar
        items={[
          { label: "Academic Home", to: "/" },
          { label: "Programs", to: "/programs" },
          { label: program.title },
        ]}
      />

      <div className="program-detail_box-2">
        <div className="program-detail_box-3">
          <div className="program-detail_box-4">
            <div className="program-detail_box-5">
              <span className="program-detail_text-1">
                {STATUS_LABELS[program.status] ?? program.status}
              </span>
              <span className="program-detail_text-2">
                {program.stats.campus ?? "Alexandria Campus"}
              </span>
            </div>
            <h1 className="program-detail_title-1">{program.title}</h1>
            <p className="program-detail_text-3">{program.overview}</p>
            <StatGrid items={stats} />
          </div>

          <section className="program-detail_section-1">
            <h2 className="program-detail_title-2">
              <span className="program-detail_text-4 material-symbols-outlined">
                menu_book
              </span>
              Included Courses in Sequence
            </h2>
            {courses.length === 0 && (
              <p className="program-detail_text-7">
                Courses for this program will be announced soon.
              </p>
            )}
            {courses.map((m, i) => {
              const no = String(i + 1).padStart(2, "0");
              return (
                <div key={m.id} className="program-detail_box-6">
                  <div className="program-detail_box-7">
                    <span
                      className={`program-detail_text-5 ${i === 0 ? "program-detail_text-5--on" : "program-detail_text-5--off"}`.trim()}
                    >
                      {no}
                    </span>
                    <div>
                      <span className="program-detail_text-6">
                        Module {no}{m.duration ? ` • ${m.duration}` : ""}
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
                      <p className="program-detail_text-7">{m.description}</p>
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
              );
            })}
          </section>

          {hasRelated && (
            <section className="program-detail_section-1">
              <h2 className="program-detail_title-2">
                <span className="program-detail_text-4 material-symbols-outlined">
                  account_tree
                </span>
                Connected Academic Pathways
              </h2>
              <div className="program-detail_related">
                {program.careerPath && (
                  <div className="program-detail_related-item">
                    <span className="program-detail_related-tag">Part of Career Path</span>
                    <span className="program-detail_related-title">{program.careerPath.title}</span>
                    <Link to={`/career-paths/${program.careerPath.slug}`} className="program-detail_related-link">
                      Explore Full Career Path ➔
                    </Link>
                  </div>
                )}
                {program.relatedPrograms.map((r) => (
                  <div key={r.id} className="program-detail_related-item">
                    <span className="program-detail_related-tag">Related Program</span>
                    <span className="program-detail_related-title">{r.title}</span>
                    <span className="program-detail_related-meta">
                      {r.duration} • {r.coursesCount} Courses
                    </span>
                    <Link to={r.link || `/programs/${r.slug}`} className="program-detail_related-link">
                      View Program ➔
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <EnrollCard
          label="Tuition & Exam Fees"
          price={formatMoney(program.tuition, program.currency)}
          note={
            program.tuitionNote ??
            "Contact admissions about corporate sponsorships and installment options."
          }
          primaryText="Apply for Program Admission"
          onPrimary={onApply}
          secondaryText="Download Program Syllabus"
          onSecondary={onDownloadSyllabus}
          secondaryBusy={syllabusLoading}
          feedback={syllabusFeedback}
          bullets={program.benefits.map((b) => b.text)}
        />
      </div>
    </div>
  );
}

export default ProgramDetailComponent;
