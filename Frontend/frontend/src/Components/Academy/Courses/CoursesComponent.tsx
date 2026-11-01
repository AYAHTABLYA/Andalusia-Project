import { memo } from "react";
import { Link } from "react-router-dom";
import type { CatalogCourse } from "../../../Types/CatalogCourse";
import Breadcrumb from "../Shared/Breadcrumb";
import CatalogHero from "../Shared/CatalogHero";
import CatalogToolbar from "../Shared/CatalogToolbar";
import CatalogState from "../Shared/CatalogState";
import Pagination from "../Shared/Pagination";
import { initials } from "../../../utils/format";
import "./style.css";

type Props = {
  courses: CatalogCourse[];
  categories: string[];
  loading: boolean;
  errorMessage?: string;
  search: string;
  category: string;
  page: number;
  pageSize: number;
  total: number;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
};

function CoursesComponent({
  courses, categories, loading, errorMessage, search, category,
  page, pageSize, total, onRetry, onPageChange, onSearch, onCategory,
}: Props) {
  return (
    <div className="courses_box-1">
      <Breadcrumb items={[{ label: "Academic Home", to: "/" }, { label: "Executive Courses Directory" }]} />
      <CatalogHero
        eyebrow="Modular Masterclasses"
        title="Executive & Professional Courses"
        text="Bridging executive acumen with rigorous hands-on technical labs and healthcare leadership. Explore Alexandria campus offline cohorts and blended diplomas."
      />
      <CatalogToolbar
        placeholder="Search courses or mentors..."
        search={search}
        onSearch={onSearch}
        categories={categories}
        active={category}
        onCategory={onCategory}
      />

      {loading ? (
        <CatalogState kind="loading" />
      ) : errorMessage ? (
        <CatalogState
          kind="error"
          title="Could not load courses"
          text={errorMessage}
          actionLabel="Retry"
          onAction={onRetry}
        />
      ) : courses.length === 0 ? (
        <CatalogState
          kind="empty"
          title="No courses found"
          text="Try a different search or category."
        />
      ) : (
        <div className="courses_box-2">
          {courses.map((item) => (
            <article key={item.id} className="courses_card-1">
              <div className="courses_box-3">
                <div className="courses_box-4">
                  <span className="courses_text-1">{item.category}</span>
                  <span className="courses_text-2">{item.seats}</span>
                </div>
                <h3 className="courses_title-1">
                  <Link to={item.link}>{item.title}</Link>
                </h3>
                <div className="courses_box-5">
                  <span className="courses_text-3 material-symbols-outlined">location_on</span>
                  <span>{item.type} • {item.duration}</span>
                </div>
                <div className="courses_box-6">
                  <div className="courses_box-7">
                    {initials(item.mentor)}
                  </div>
                  <div className="courses_box-8">
                    <div className="courses_box-9">{item.mentor}</div>
                    <div className="courses_box-10">{item.role}</div>
                  </div>
                </div>
              </div>
              <div className="courses_box-11">
                <span className="courses_text-4">{item.tuition}</span>
                <Link to={item.link} className="courses_link-1">
                  <span>View Course</span>
                  <span className="courses_text-5 material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !errorMessage && (
        <Pagination page={page} pageSize={pageSize} total={total} onPage={onPageChange} />
      )}
    </div>
  );
}

export default memo(CoursesComponent);
