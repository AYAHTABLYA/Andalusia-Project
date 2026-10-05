import { memo } from "react";
import { Link } from "react-router-dom";
import type { Program } from "../../../Types/Program";
import Breadcrumb from "../Shared/Breadcrumb";
import CatalogHero from "../Shared/CatalogHero";
import CatalogToolbar from "../Shared/CatalogToolbar";
import { PROGRAM_CATEGORIES } from "./constants";
import "./style.css";

type Props = {
  programs: Program[];
  search: string;
  category: string;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
};

function ProgramsComponent({
  programs,
  search,
  category,
  onSearch,
  onCategory,
}: Props) {
  return (
    <div className="programs_box-1">
      <Breadcrumb
        items={[
          { label: "Academic Home", to: "/" },
          { label: "Executive Programs Catalog" },
        ]}
      />
      <CatalogHero
        eyebrow="Accredited Diplomas"
        title="Executive & Postgraduate Programs"
        text="Comprehensive multi-course diploma curricula combining technical depth, clinical governance, and boardroom acumen in Alexandria and blended cohorts."
      />
      <CatalogToolbar
        placeholder="Search programs by title..."
        search={search}
        onSearch={onSearch}
        categories={PROGRAM_CATEGORIES}
        active={category}
        onCategory={onCategory}
      />

      <div className="programs_box-2">
        {programs.map((prog) => (
          <article key={prog.id} className="programs_card-1">
            <div className="programs_box-3">
              <div className="programs_box-4">
                <span className="programs_text-1">{prog.category}</span>
                <span className="programs_text-2">
                  <span className="programs_text-3"></span>Enrolling
                </span>
              </div>
              <h3 className="programs_title-1">
                <Link to={prog.link}>{prog.title}</Link>
              </h3>
              <div className="programs_box-5">
                <span>{prog.coursesCount} Courses</span>
                <span>•</span>
                <span>{prog.duration}</span>
                <span>•</span>
                <span>{prog.accreditation}</span>
              </div>
              <div className="programs_box-6">
                Alexandria Campus (Gleem) • Cohort Starts {prog.cohortDate}
              </div>
            </div>
            <div className="programs_box-7">
              <div>
                <span className="programs_text-4">Tuition</span>
                <span className="programs_text-5">{prog.tuition}</span>
              </div>
              <Link to={prog.link} className="programs_link-1">
                <span>View Program</span>
                <span className="programs_text-6 material-symbols-outlined">
                  arrow_forward
                </span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default memo(ProgramsComponent);
