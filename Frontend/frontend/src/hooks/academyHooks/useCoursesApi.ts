import { apiGet, apiPost } from "../../apis/academyApi";
import type { Paginated } from "../../Types/Paginated";
import type {
  CourseApplicationResponseDto,
  CourseDetailDto,
  CourseListItemDto,
  CreateCourseApplicationBody,
  FeaturedCourseDto,
} from "../../Types/AcademyApi";
import useApi from "./useApi";

type CourseFilters = {
  search: string;
  category: string;
  page: number;
  pageSize: number;
  sort?: string;
};

// GET /api/courses?search=&category=&sort=&page=&pageSize=
function useCourses({ search, category, page, pageSize, sort }: CourseFilters) {
  return useApi<Paginated<CourseListItemDto>>(
    (signal) =>
      apiGet(
        "/api/courses",
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

// GET /api/courses/categories
function useCourseCategories() {
  return useApi<string[]>((signal) => apiGet("/api/courses/categories", undefined, signal), []);
}

// GET /api/courses/featured?take=3
function useFeaturedCourses(take = 3) {
  return useApi<FeaturedCourseDto[]>(
    (signal) => apiGet("/api/courses/featured", { take }, signal),
    [take],
  );
}

// GET /api/courses/coming-soon?take=3
function useComingSoonCourses(take = 3) {
  return useApi<FeaturedCourseDto[]>(
    (signal) => apiGet("/api/courses/coming-soon", { take }, signal),
    [take],
  );
}

// GET /api/courses/{slug}
function useCourse(slug: string | undefined) {
  return useApi<CourseDetailDto>(
    (signal) => apiGet(`/api/courses/${encodeURIComponent(slug ?? "")}`, undefined, signal),
    [slug],
  );
}

// POST /api/courses/{slug}/applications  (guests need fullName + email)
function applyToCourse(slug: string, body: CreateCourseApplicationBody) {
  return apiPost<CourseApplicationResponseDto>(
    `/api/courses/${encodeURIComponent(slug)}/applications`,
    body,
  );
}

export {
  useCourses,
  useCourseCategories,
  useFeaturedCourses,
  useComingSoonCourses,
  useCourse,
  applyToCourse,
};
