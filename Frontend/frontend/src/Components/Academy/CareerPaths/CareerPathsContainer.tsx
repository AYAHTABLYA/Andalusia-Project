import { useMemo, useState } from "react";
import CareerPathsComponent from "./CareerPathsComponent";
import { CAREER_PATHS_PAGE_SIZE } from "./constants";
import { toCareerPath } from "../../../apis/mappers";
import {
  useCareerPathDomains,
  useCareerPaths,
} from "../../../hooks/academyHooks/useCareerPathsApi";
import useDebouncedValue from "../../../hooks/academyHooks/useDebouncedValue";
import type { ApiState } from "../../../Types/ApiState";

function CareerPathsContainer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchQuery);

  const { data, loading, error, reload } = useCareerPaths({
    search: debouncedSearch,
    domain: selectedDomain,
    page,
    pageSize: CAREER_PATHS_PAGE_SIZE,
  });
  const { data: domains } = useCareerPathDomains();

  const domainOptions = useMemo(
    () => [
      { value: "All", label: "All Domains" },
      ...(domains ?? []).map((d) => ({ value: d, label: d })),
    ],
    [domains],
  );

  const paths = useMemo(() => (data?.data ?? []).map(toCareerPath), [data]);

  const apiState: ApiState = error
    ? "error"
    : loading && !data
      ? "skeleton"
      : paths.length === 0
        ? "empty"
        : "catalog";

  function handleSearch(value: string) {
    setSearchQuery(value);
    setPage(1);
  }

  function handleDomain(value: string) {
    setSelectedDomain(value);
    setPage(1);
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedDomain("All");
    setPage(1);
  }

  return (
    <CareerPathsComponent
      paths={paths}
      apiState={apiState}
      errorMessage={error?.message}
      searchQuery={searchQuery}
      selectedDomain={selectedDomain}
      domainOptions={domainOptions}
      page={page}
      pageSize={CAREER_PATHS_PAGE_SIZE}
      total={data?.count ?? 0}
      onRetry={reload}
      onPageChange={setPage}
      onSearchChange={handleSearch}
      onDomainChange={handleDomain}
      onReset={resetFilters}
    />
  );
}

export default CareerPathsContainer;
