import { useMemo, useState } from "react";
import CoursesComponent from "./CoursesComponent";
import { COURSES_PAGE_SIZE } from "./constants";
import { toCatalogCourse } from "../../../apis/mappers";
import { useCourseCategories, useCourses } from "../../../hooks/academyHooks/useCoursesApi";
import useDebouncedValue from "../../../hooks/academyHooks/useDebouncedValue";

function CoursesContainer() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error, reload } = useCourses({
    search: debouncedSearch,
    category,
    page,
    pageSize: COURSES_PAGE_SIZE,
  });
  const { data: categoryData } = useCourseCategories();

  const categories = useMemo(() => ["All", ...(categoryData ?? [])], [categoryData]);
  const courses = useMemo(() => (data?.data ?? []).map(toCatalogCourse), [data]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <CoursesComponent
      courses={courses}
      categories={categories}
      loading={loading && !data}
      errorMessage={error?.message}
      search={search}
      category={category}
      page={page}
      pageSize={COURSES_PAGE_SIZE}
      total={data?.count ?? 0}
      onRetry={reload}
      onPageChange={setPage}
      onSearch={handleSearch}
      onCategory={handleCategory}
    />
  );
}

export default CoursesContainer;
