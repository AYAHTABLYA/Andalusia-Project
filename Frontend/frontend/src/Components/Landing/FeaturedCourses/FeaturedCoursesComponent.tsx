import { memo } from "react";
import type { Course } from "../../../Types/Course";
import "./style.css";

function FeaturedCoursesComponent({ courses }: { courses: Course[] }) {
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
                <a className="btn btn-primary" href="#apply-now">
                  Apply / Syllabus
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="featured-courses_view-all">
          <a href="#programs-section">
            Browse All 24+ Andalusian Diplomas &amp; Courses →
          </a>
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturedCoursesComponent);
