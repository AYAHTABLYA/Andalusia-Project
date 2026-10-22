import { Link } from "react-router-dom";
import Breadcrumb from "../Shared/Breadcrumb";
import StatGrid from "../Shared/StatGrid";
import EnrollCard from "../Shared/EnrollCard";
import type { CourseDetailDto } from "../../../Types/AcademyApi";
import { formatMoney, initials } from "../../../utils/format";
import "./style.css";

type Props = {
  course: CourseDetailDto;
  onApply: () => void;
  onDownloadSyllabus: () => void;
  syllabusLoading: boolean;
  syllabusFeedback: { kind: "success" | "error"; text: string } | null;
};

function CourseDetailComponent({ course, onApply, onDownloadSyllabus, syllabusLoading, syllabusFeedback }: Props) {
  const stats = [
    { label: "Duration", value: course.stats.duration },
    { label: "Level", value: course.stats.level },
    { label: "Accreditation", value: course.stats.accreditation },
    { label: "Cohort Start", value: course.stats.cohortStart },
  ].filter((s) => s.value);

  const connected = [
    course.program && {
      tag: "Belongs to Program",
      title: course.program.title,
      to: `/programs/${course.program.slug}`,
      cta: "View Program ➔",
    },
    course.careerPath && {
      tag: "Included in Career Path",
      title: course.careerPath.title,
      to: `/career-paths/${course.careerPath.slug}`,
      cta: "Explore Full Career Path ➔",
    },
  ].filter((c): c is { tag: string; title: string; to: string; cta: string } => !!c);

  return (
    <div className="course-detail_box-1">
      <Breadcrumb bar items={[{ label: "Academic Home", to: "/" }, { label: "Courses", to: "/courses" }, { label: course.title }]} />

      <div className="course-detail_box-2">
        <div className="course-detail_box-3">
          <div className="course-detail_box-4">
            <div className="course-detail_box-5">
              <span className="course-detail_text-1"></span>
              {course.statusLabel}
            </div>
            <h1 className="course-detail_title-1">{course.title}</h1>
            <p className="course-detail_text-2">{course.description}</p>
            <StatGrid items={stats} />
          </div>

          {course.learnItems.length > 0 && (
            <section className="course-detail_section-1">
              <h2 className="course-detail_title-2">
                <span className="course-detail_text-3 material-symbols-outlined">fact_check</span>
                What You Will Learn
              </h2>
              <div className="course-detail_box-6">
                {course.learnItems.map((l) => (
                  <div key={l.title} className="course-detail_box-7">
                    <strong className="course-detail_strong-1">{l.title}</strong>
                    <span className="course-detail_text-4">{l.text}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="course-detail_section-2">
            <div className="course-detail_box-8">{initials(course.mentor.name)}</div>
            <div>
              <h3 className="course-detail_title-3">{course.mentor.name}</h3>
              <p className="course-detail_text-5">{course.mentor.title}</p>
              {course.mentor.bio && <p className="course-detail_text-6">{course.mentor.bio}</p>}
            </div>
          </section>

          {connected.length > 0 && (
            <section className="course-detail_section-3">
              <h2 className="course-detail_title-4">Connected Academic Pathways</h2>
              <div className="course-detail_box-9">
                {connected.map((c) => (
                  <div key={c.to} className="course-detail_box-10">
                    <span className="course-detail_text-7">{c.tag}</span>
                    <h4 className="course-detail_title-5">{c.title}</h4>
                    <Link to={c.to} className="course-detail_link-1">{c.cta}</Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <EnrollCard
          label="Course Tuition"
          price={formatMoney(course.enroll.tuition, course.enroll.currency)}
          note={course.enroll.note}
          primaryText="Apply for Cohort Interview"
          onPrimary={onApply}
          secondaryText="Download Course Syllabus"
          onSecondary={onDownloadSyllabus}
          secondaryBusy={syllabusLoading}
          feedback={syllabusFeedback}
          bullets={course.enroll.bullets}
        />
      </div>
    </div>
  );
}

export default CourseDetailComponent;
