// Values understood by the API's `sort` query parameter (GET /api/courses and /api/programs).
type SortOption = { value: string; label: string };

const CATALOG_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Default order" },
  { value: "title_asc", label: "Title: A to Z" },
  { value: "title_desc", label: "Title: Z to A" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export { CATALOG_SORT_OPTIONS };
export type { SortOption };
