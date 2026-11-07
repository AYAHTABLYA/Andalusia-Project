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
};

// GET /api/courses?search=&category=&page=&pageSize=
function useCourses({ search, category, page, pageSize }: CourseFilters) {
  return useApi<Paginated<CourseListItemDto>>(
    (signal) =>
      apiGet(
        "/api/courses",
        {
          search: search.trim(),
          category: category === "All" ? undefined : category,
          page,
          pageSize,
        },
        signal,
      ),
    [search, category, page, pageSize],
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

export { useCourses, useCourseCategories, useFeaturedCourses, useCourse, applyToCourse };
