import { CATALOG_SORT_OPTIONS } from "./sortOptions";
import "./style.css";

type Props = {
  placeholder: string;
  search: string;
  onSearch: (v: string) => void;
  categories: string[];
  active: string;
  onCategory: (v: string) => void;
  // Optional: when provided, a sort dropdown is shown.
  sort?: string;
  onSort?: (v: string) => void;
};

function CatalogToolbar({
  placeholder,
  search,
  onSearch,
  categories,
  active,
  onCategory,
  sort,
  onSort,
}: Props) {
  return (
    <div className="catalog-toolbar_box-1">
      <div className="catalog-toolbar_box-2">
        <span className="catalog-toolbar_text-1 material-symbols-outlined">search</span>
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="catalog-toolbar_input-1"
        />
      </div>
      <div className="catalog-toolbar_box-3">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategory(c)}
            className={`catalog-toolbar_btn-1 ${active === c ? "catalog-toolbar_btn-1--active" : "catalog-toolbar_btn-1--idle"}`.trim()}
          >
            {c}
          </button>
        ))}
      </div>
      {onSort && (
        <label className="catalog-toolbar_sort">
          <span className="catalog-toolbar_sort-label">Sort by</span>
          <select
            className="catalog-toolbar_select"
            value={sort ?? ""}
            onChange={(e) => onSort(e.target.value)}
            aria-label="Sort results"
          >
            {CATALOG_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

export default CatalogToolbar;
