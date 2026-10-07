import { useState } from "react";
import CareerPathsComponent from "./CareerPathsComponent";
import { CAREER_PATHS } from "./constants";
import type { ApiState } from "../../../Types/ApiState";

function CareerPathsContainer() {
  const [apiState, setApiState] = useState<ApiState>("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

  const query = searchQuery.toLowerCase();
  const filteredPaths = CAREER_PATHS.filter(
    (p) =>
      (selectedDomain === "All" || p.domain.includes(selectedDomain)) &&
      (p.title.toLowerCase().includes(query) || p.roles.toLowerCase().includes(query)),
  );

  function resetFilters() {
    setSearchQuery("");
    setSelectedDomain("All");
  }

  return (
    <CareerPathsComponent
      paths={filteredPaths}
      apiState={apiState}
      searchQuery={searchQuery}
      selectedDomain={selectedDomain}
      onApiStateChange={setApiState}
      onSearchChange={setSearchQuery}
      onDomainChange={setSelectedDomain}
      onReset={resetFilters}
    />
  );
}

export default CareerPathsContainer;
