import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProgramsComponent from "./ProgramsComponent";
import { PROGRAMS_PAGE_SIZE, PROGRAM_IMAGES } from "./constants";
import { toProgram } from "../../../apis/mappers";
import { useProgramCategories, usePrograms } from "../../../hooks/academyHooks/useProgramsApi";
import { getCatalogImage } from "../../../utils/catalogImage";
import useDebouncedValue from "../../../hooks/academyHooks/useDebouncedValue";

function ProgramsContainer() {
  // The landing page links here with ?category=<name> (Popular Categories).
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(() => searchParams.get("category") || "All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error, reload } = usePrograms({
    search: debouncedSearch,
    category,
    sort,
    page,
    pageSize: PROGRAMS_PAGE_SIZE,
  });
  const { data: categoryData } = useProgramCategories();

  const categories = useMemo(
    () => ["All", ...(categoryData ?? []).map((c) => c.name)],
    [categoryData],
  );
  const programs = useMemo(
    () =>
      (data?.data ?? []).map(toProgram).map((program) => ({
        ...program,
        image: getCatalogImage(PROGRAM_IMAGES, "programs", program.title, program.slug),
      })),
    [data],
  );

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSort(value: string) {
    setSort(value);
    setPage(1);
  }

  function handleCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <ProgramsComponent
      programs={programs}
      categories={categories}
      loading={loading && !data}
      errorMessage={error?.message}
      search={search}
      category={category}
      sort={sort}
      page={page}
      pageSize={PROGRAMS_PAGE_SIZE}
      total={data?.count ?? 0}
      onRetry={reload}
      onPageChange={setPage}
      onSearch={handleSearch}
      onCategory={handleCategory}
      onSort={handleSort}
    />
  );
}

export default ProgramsContainer;
