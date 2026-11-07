import { apiGet, apiPost } from "../../apis/academyApi";
import type { Paginated } from "../../Types/Paginated";
import type {
  ProgramApplicationResponseDto,
  ProgramCategoryDto,
  ProgramDetailDto,
  ProgramListItemDto,
  PopularCategoryDto,
} from "../../Types/AcademyApi";
import useApi from "./useApi";

type ProgramFilters = {
  search: string;
  category: string;
  page: number;
  pageSize: number;
  sort?: string;
};

// GET /api/programs?search=&category=&sort=&page=&pageSize=
function usePrograms({ search, category, page, pageSize, sort }: ProgramFilters) {
  return useApi<Paginated<ProgramListItemDto>>(
    (signal) =>
      apiGet(
        "/api/programs",
        {
          search: search.trim(),
          category: category === "All" ? undefined : category,
          sort: sort || undefined,
          page,
          pageSize,
        },
        signal,
      ),
    [search, category, page, pageSize, sort],
  );
}

// GET /api/programs/categories
function useProgramCategories() {
  return useApi<ProgramCategoryDto[]>(
    (signal) => apiGet("/api/programs/categories", undefined, signal),
    [],
  );
}

// GET /api/programs/categories/popular?take=6
function usePopularCategories(take = 6) {
  return useApi<PopularCategoryDto[]>(
    (signal) => apiGet("/api/programs/categories/popular", { take }, signal),
    [take],
  );
}

// GET /api/programs/{slug}
function useProgram(slug: string | undefined) {
  return useApi<ProgramDetailDto>(
    (signal) => apiGet(`/api/programs/${encodeURIComponent(slug ?? "")}`, undefined, signal),
    [slug],
  );
}

// POST /api/programs/{slug}/applications  (requires a logged-in user / JWT)
function applyToProgram(slug: string, scheduleId?: number) {
  return apiPost<ProgramApplicationResponseDto>(
    `/api/programs/${encodeURIComponent(slug)}/applications`,
    { scheduleId: scheduleId ?? null },
  );
}

export { usePrograms, useProgramCategories, usePopularCategories, useProgram, applyToProgram };
