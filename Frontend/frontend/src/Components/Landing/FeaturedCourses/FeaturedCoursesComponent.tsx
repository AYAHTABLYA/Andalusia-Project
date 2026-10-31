import { memo } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../../../Types/Course";
import "./style.css";

type Props = {
  courses: Course[];
  loading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

function FeaturedCoursesComponent({ courses, loading, errorMessage, onRetry }: Props) {
  return (
    <section className="featured-courses" data-purpose="course-offerings" id="featured-courses">
      <div className="section-wrap">
        <div className="featured-courses_head">
          <div>
            <div className="featured-courses_kicker">
              <span className="featured-courses_dot" />
              <span className="eyebrow">Fall &amp; Winter Cohorts</span>
            </div>
            <h2 className="heading-serif featured-courses_title">
              Featured Offline &amp; Blended Programs
            </h2>
          </div>
          <div className="featured-courses_pills">
            <button type="button" className="featured-courses_pill featured-courses_pill--active">
              All Courses
            </button>
            <button type="button" className="featured-courses_pill">Offline Only (Alex)</button>
            <button type="button" className="featured-courses_pill">Executive Diplomas</button>
            <button type="button" className="featured-courses_pill">Cloud &amp; Security</button>
          </div>
        </div>

        {loading ? (
          <p className="featured-courses_state" aria-busy="true">Loading featured courses…</p>
        ) : errorMessage ? (
          <p className="featured-courses_state" role="alert">
            Could not load featured courses. {errorMessage}{" "}
            <button type="button" className="featured-courses_retry" onClick={onRetry}>Retry</button>
          </p>
        ) : courses.length === 0 ? (
          <p className="featured-courses_state">New cohorts will be announced soon.</p>
        ) : (
        <div className="featured-courses_grid">
          {courses.map((course) => (
            <article key={course.id} className="course-card card" data-purpose="course-card">
              <div className="course-card_body">
                <div className="course-card_badges">
                  <span className="course-card_category">{course.category}</span>
                  <span
                    className={
                      "course-card_mode course-card_mode--" + course.modeVariant
                    }
                  >
                    {course.modeLabel}
                  </span>
                </div>

                <h3>{course.title}</h3>
                <p className="course-card_description">{course.description}</p>

                <div className="course-card_details">
                  <div>
                    <span>Next Batch:</span>
                    <strong>{course.nextBatch}</strong>
                  </div>
                  <div>
                    <span>Duration:</span>
                    <span className="course-card_value">{course.duration}</span>
                  </div>
                  <div>
                    <span>Campus Hall:</span>
                    <span className="course-card_value">{course.hall}</span>
                  </div>
                </div>

                <div className="course-card_instructor">
                  <div className="course-card_avatar">{course.instructorInitials}</div>
                  <div>
                    <span className="course-card_instructor-name">{course.instructorName}</span>
                    <span className="course-card_instructor-title">{course.instructorTitle}</span>
                  </div>
                </div>
              </div>

              <div className="course-card_footer">
                <div>
                  <span className="course-card_price-label">
                    Tuition (Installments Avail.)
                  </span>
                  <span className="course-card_price">{course.price}</span>
                </div>
                <Link className="btn btn-primary" to={`/courses/${course.slug}`}>
                  Apply / Syllabus
                </Link>
              </div>
            </article>
          ))}
        </div>
        )}

        <div className="featured-courses_view-all">
          <Link to="/courses">
            Browse All Andalusian Diplomas &amp; Courses →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturedCoursesComponent);
