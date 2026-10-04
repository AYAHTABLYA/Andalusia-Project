import { Link } from "react-router-dom";
import Breadcrumb from "../Shared/Breadcrumb";
import StatGrid from "../Shared/StatGrid";
import EnrollCard from "../Shared/EnrollCard";
import { CONNECTED, COURSE_BULLETS, COURSE_STATS, LEARN_ITEMS } from "./constants";
import "./style.css";

function CourseDetailComponent() {
  return (
    <div className="course-detail_box-1">
      <Breadcrumb bar items={[{ label: "Academic Home", to: "/" }, { label: "Courses", to: "/courses" }, { label: "Generative AI in Banking" }]} />

      <div className="course-detail_box-2">
        <div className="course-detail_box-3">
          <div className="course-detail_box-4">
            <div className="course-detail_box-5">
              <span className="course-detail_text-1"></span>
              Enrolling (4 Seats Left) • Alexandria Campus Offline Cohort
            </div>
            <h1 className="course-detail_title-1">Enterprise Generative AI &amp; Regulatory Compliance in Banking</h1>
            <p className="course-detail_text-2">
              Master real-time LLM architectures, fine-tuning retrieval augmented generation (RAG) pipelines, open banking standards, and Central Bank of Egypt &amp; EU AI Act regulatory compliance frameworks.
            </p>
            <StatGrid items={COURSE_STATS} />
          </div>

          <section className="course-detail_section-1">
            <h2 className="course-detail_title-2">
              <span className="course-detail_text-3 material-symbols-outlined">fact_check</span>
              What You Will Learn
            </h2>
            <div className="course-detail_box-6">
              {LEARN_ITEMS.map((l) => (
                <div key={l.title} className="course-detail_box-7">
                  <strong className="course-detail_strong-1">{l.title}</strong>
                  <span className="course-detail_text-4">{l.text}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="course-detail_section-2">
            <div className="course-detail_box-8">TM</div>
            <div>
              <h3 className="course-detail_title-3">Dr. Tarek Mansour</h3>
              <p className="course-detail_text-5">Principal AI Architect &amp; Fellow • Ex-Google Research</p>
              <p className="course-detail_text-6">
                Senior advisor to Commercial International Bank (CIB). Mentors cohort fellows weekly in Alexandria Gleem Hall B.
              </p>
            </div>
          </section>

          <section className="course-detail_section-3">
            <h2 className="course-detail_title-4">Connected Academic Pathways</h2>
            <div className="course-detail_box-9">
              {CONNECTED.map((c) => (
                <div key={c.to} className="course-detail_box-10">
                  <span className="course-detail_text-7">{c.tag}</span>
                  <h4 className="course-detail_title-5">{c.title}</h4>
                  <Link to={c.to} className="course-detail_link-1">{c.cta}</Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        <EnrollCard
          label="Course Tuition"
          price="EGP 18,500"
          note="CIB & Banque Misr corporate subsidies applicable."
          primaryText="Apply for Cohort Interview"
          primaryMsg="Application interview booked for Enterprise Generative AI in Banking."
          secondaryText="Download Course Syllabus"
          secondaryMsg="Downloading 12-Week Course Syllabus (PDF)..."
          bullets={COURSE_BULLETS}
        />
      </div>
    </div>
  );
}

export default CourseDetailComponent;
