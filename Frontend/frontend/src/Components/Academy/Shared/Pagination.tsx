import "./style.css";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
};

function pageNumbers(current: number, last: number): (number | "gap")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  if (start > 2) pages.push("gap");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < last - 1) pages.push("gap");
  pages.push(last);
  return pages;
}

function Pagination({ page, pageSize, total, onPage }: Props) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (last <= 1) return null;

  return (
    <nav className="pagination_box-1" aria-label="Pagination">
      <button
        type="button"
        className="pagination_btn-1"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        <span className="material-symbols-outlined">chevron_left</span>
        Prev
      </button>

      {pageNumbers(page, last).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="pagination_text-1">…</span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPage(p)}
            className={`pagination_btn-2 ${p === page ? "pagination_btn-2--active" : ""}`.trim()}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination_btn-1"
        disabled={page >= last}
        onClick={() => onPage(page + 1)}
      >
        Next
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </nav>
  );
}

export default Pagination;
