import { memo } from "react";
import { Link } from "react-router-dom";
import type { CatalogCourse } from "../../../Types/CatalogCourse";
import Breadcrumb from "../Shared/Breadcrumb";
import CatalogHero from "../Shared/CatalogHero";
import CatalogToolbar from "../Shared/CatalogToolbar";
import { COURSE_CATEGORIES } from "./constants";
import "./style.css";

type Props = {
  courses: CatalogCourse[];
  search: string;
  category: string;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("");

function CoursesComponent({ courses, search, category, onSearch, onCategory }: Props) {
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
        categories={COURSE_CATEGORIES}
        active={category}
        onCategory={onCategory}
      />

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
    </div>
  );
}

export default memo(CoursesComponent);
