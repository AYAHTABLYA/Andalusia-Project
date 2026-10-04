import { useState } from "react";
import CoursesComponent from "./CoursesComponent";
import { COURSES } from "./constants";

function CoursesContainer() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const courses = COURSES.filter(
    (c) => (category === "All" || c.category === category) && (c.title.toLowerCase().includes(q) || c.mentor.toLowerCase().includes(q)),
  );

  return (
    <CoursesComponent courses={courses} search={search} category={category} onSearch={setSearch} onCategory={setCategory} />
  );
}

export default CoursesContainer;
