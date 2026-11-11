// Mirrors Andalusia.Shared.PaginatedResult<T> (camelCase over the wire).
type Paginated<T> = {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
};

export type { Paginated };
