import { Link } from "react-router-dom";
import { useSiteLanguage } from "../../LanguageSwitcher";
import "../FeaturedCourses/style.css";

// Programs the academy expects to add in the coming period.
// Edit this list freely: titles, descriptions and the expected window are plain text.
type Upcoming = {
  id: number;
  category: { en: string; ar: string };
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  expected: { en: string; ar: string };
};

const UPCOMING: Upcoming[] = [
  {
    id: 1,
    category: { en: "Healthcare", ar: "الرعاية الصحية" },
    title: {
      en: "Healthcare Quality & Patient Safety Diploma",
      ar: "دبلومة الجودة وسلامة المرضى في الرعاية الصحية",
    },
    description: {
      en: "Quality systems, accreditation readiness, incident reporting, and patient-safety practice inside real hospital settings.",
      ar: "نظم الجودة والاستعداد للاعتماد والإبلاغ عن الحوادث وممارسات سلامة المرضى داخل بيئات مستشفيات حقيقية.",
    },
    expected: { en: "Q1 2027", ar: "الربع الأول 2027" },
  },
  {
    id: 2,
    category: { en: "Health Technology", ar: "التكنولوجيا الصحية" },
    title: {
      en: "Health Informatics & AI in Healthcare",
      ar: "المعلوماتية الصحية والذكاء الاصطناعي في الرعاية الصحية",
    },
    description: {
      en: "Electronic health records, clinical data analytics, and practical AI tools for hospitals and healthcare teams.",
      ar: "السجلات الصحية الإلكترونية وتحليل البيانات السريرية وأدوات الذكاء الاصطناعي العملية للمستشفيات والفرق الصحية.",
    },
    expected: { en: "Q1 2027", ar: "الربع الأول 2027" },
  },
  {
    id: 3,
    category: { en: "Data & Analytics", ar: "البيانات والتحليلات" },
    title: {
      en: "Business Intelligence & Data Analytics with Power BI",
      ar: "ذكاء الأعمال وتحليل البيانات باستخدام Power BI",
    },
    description: {
      en: "From raw data to executive dashboards: modeling, DAX, visual storytelling, and a capstone built on real company data.",
      ar: "من البيانات الخام إلى لوحات المتابعة التنفيذية: النمذجة وDAX وعرض النتائج بصريًا ومشروع تخرج على بيانات شركة حقيقية.",
    },
    expected: { en: "Q2 2027", ar: "الربع الثاني 2027" },
  },
];

function ComingSoonContainer() {
  const language = useSiteLanguage();
  const t = (v: { en: string; ar: string }) => v[language];
  const ar = language === "ar";

  return (
    <section
      className="featured-courses"
      data-purpose="course-offerings"
      id="coming-soon"
    >
      <div className="section-wrap">
        <div className="featured-courses_head">
          <div>
            <div className="featured-courses_kicker">
              <span className="featured-courses_dot" />
              <span className="eyebrow">Coming Soon</span>
            </div>
            <h2 className="heading-serif featured-courses_title">
              New Cohorts Opening Soon
            </h2>
          </div>
        </div>

        {/* Card text is bilingual here, so the DOM translator must leave it alone */}
        <div className="featured-courses_grid" data-no-translate>
          {UPCOMING.map((item) => (
            <article
              key={item.id}
              className="course-card card"
              data-purpose="course-card"
            >
              <div className="course-card_body">
                <div className="course-card_badges">
                  <span className="course-card_category">
                    {t(item.category)}
                  </span>
                  <span className="course-card_mode course-card_mode--blended">
                    {ar ? "قريبًا" : "Coming soon"}
                  </span>
                </div>
                <h3>{t(item.title)}</h3>
                <p className="course-card_description">{t(item.description)}</p>
              </div>

              <div className="course-card_footer">
                <div>
                  <span className="course-card_price-label">
                    {ar ? "الموعد المتوقع" : "Expected opening"}
                  </span>
                  <span className="course-card_price">{t(item.expected)}</span>
                </div>
                <Link className="btn btn-primary" to="/courses">
                  {ar ? "تصفح الكورسات الحالية" : "Browse current courses"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComingSoonContainer;
