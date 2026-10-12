import { useMemo, useState } from "react";
import ProgramsComponent from "./ProgramsComponent";
import { PROGRAMS_PAGE_SIZE } from "./constants";
import { toProgram } from "../../../apis/mappers";
import { useProgramCategories, usePrograms } from "../../../hooks/academyHooks/useProgramsApi";
import useDebouncedValue from "../../../hooks/academyHooks/useDebouncedValue";

function ProgramsContainer() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error, reload } = usePrograms({
    search: debouncedSearch,
    category,
    page,
    pageSize: PROGRAMS_PAGE_SIZE,
  });
  const { data: categoryData } = useProgramCategories();

  const categories = useMemo(
    () => ["All", ...(categoryData ?? []).map((c) => c.name)],
    [categoryData],
  );
  const programs = useMemo(() => (data?.data ?? []).map(toProgram), [data]);

  function handleSearch(value: string) {
    setSearch(value);
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
      page={page}
      pageSize={PROGRAMS_PAGE_SIZE}
      total={data?.count ?? 0}
      onRetry={reload}
      onPageChange={setPage}
      onSearch={handleSearch}
      onCategory={handleCategory}
    />
  );
}

export default ProgramsContainer;
