import type { Paginated } from "../../Types/Paginated";
import { apiGet } from "../../apis/academyApi";
import type {
  CareerPathDetailDto,
  CareerPathListItemDto,
} from "../../Types/AcademyApi";
import useApi from "./useApi";

type CareerPathFilters = {
  search: string;
  domain: string;
  page: number;
  pageSize: number;
};

// GET /api/career-paths?search=&domain=&page=&pageSize=
function useCareerPaths({ search, domain, page, pageSize }: CareerPathFilters) {
  return useApi<Paginated<CareerPathListItemDto>>(
    (signal) =>
      apiGet(
        "/api/career-paths",
        {
          search: search.trim(),
          domain: domain === "All" ? undefined : domain,
          page,
          pageSize,
        },
        signal,
      ),
    [search, domain, page, pageSize],
  );
}

// GET /api/career-paths/domains
function useCareerPathDomains() {
  return useApi<string[]>(
    (signal) => apiGet("/api/career-paths/domains", undefined, signal),
    [],
  );
}

// GET /api/career-paths/{slug}
function useCareerPath(slug: string | undefined) {
  return useApi<CareerPathDetailDto>(
    (signal) =>
      apiGet(
        `/api/career-paths/${encodeURIComponent(slug ?? "")}`,
        undefined,
        signal,
      ),
    [slug],
  );
}

export { useCareerPaths, useCareerPathDomains, useCareerPath };
