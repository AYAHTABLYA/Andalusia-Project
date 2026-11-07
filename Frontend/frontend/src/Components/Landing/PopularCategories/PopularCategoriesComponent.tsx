import { memo } from "react";
import { Link } from "react-router-dom";
import type { PopularCategoryDto } from "../../../Types/AcademyApi";
import "./style.css";

type Props = {
  categories: PopularCategoryDto[];
  loading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

function PopularCategoriesComponent({ categories, loading, errorMessage, onRetry }: Props) {
  return (
    <section className="popular-categories" data-purpose="popular-categories" id="popular-categories">
      <div className="section-wrap">
        <div className="popular-categories_head">
          <span className="eyebrow">Explore By Interest</span>
          <h2 className="heading-serif popular-categories_title">Popular Categories</h2>
        </div>

        {loading ? (
          <p className="popular-categories_state" aria-busy="true">Loading categories…</p>
        ) : errorMessage ? (
          <p className="popular-categories_state" role="alert">
            Could not load categories. {errorMessage}{" "}
            <button type="button" className="popular-categories_retry" onClick={onRetry}>Retry</button>
          </p>
        ) : (
          <ul className="popular-categories_grid">
            {categories.map((category) => (
              <li key={category.categoryId}>
                <Link
                  className="popular-categories_card card"
                  to={`/programs?category=${encodeURIComponent(category.name)}`}
                >
                  {category.isTrending && <span className="popular-categories_badge">Trending</span>}
                  <span className="popular-categories_name">{category.name}</span>
                  <span className="popular-categories_count">
                    {category.programsCount} {category.programsCount === 1 ? "program" : "programs"}
                  </span>
                  <span className="popular-categories_arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default memo(PopularCategoriesComponent);
