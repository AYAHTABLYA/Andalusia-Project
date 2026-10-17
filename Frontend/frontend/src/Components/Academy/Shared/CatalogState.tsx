import "./style.css";

type Props = {
  kind: "loading" | "empty" | "error" | "notfound";
  title?: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
  rows?: number;
};

const ICONS = {
  loading: "hourglass_top",
  empty: "filter_alt_off",
  error: "cloud_off",
  notfound: "search_off",
} as const;

const TITLES = {
  loading: "Loading…",
  empty: "Nothing found",
  error: "Could not load data",
  notfound: "Not found",
} as const;

// Loading skeleton / empty / error / 404 block shared by the catalog + detail pages.
function CatalogState({ kind, title, text, actionLabel, onAction, rows = 6 }: Props) {
  if (kind === "loading") {
    return (
      <div className="catalog-state_grid" aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="catalog-state_skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="catalog-state_box-1" role={kind === "error" ? "alert" : undefined}>
      <span className="catalog-state_icon material-symbols-outlined">{ICONS[kind]}</span>
      <h3 className="catalog-state_title">{title ?? TITLES[kind]}</h3>
      {text && <p className="catalog-state_text">{text}</p>}
      {actionLabel && onAction && (
        <button type="button" className="catalog-state_btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default CatalogState;
