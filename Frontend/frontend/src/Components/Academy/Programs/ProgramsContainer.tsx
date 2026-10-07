import { useState } from "react";
import ProgramsComponent from "./ProgramsComponent";
import { PROGRAMS } from "./constants";

function ProgramsContainer() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const programs = PROGRAMS.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ProgramsComponent
      programs={programs}
      search={search}
      category={category}
      onSearch={setSearch}
      onCategory={setCategory}
    />
  );
}

export default ProgramsContainer;
