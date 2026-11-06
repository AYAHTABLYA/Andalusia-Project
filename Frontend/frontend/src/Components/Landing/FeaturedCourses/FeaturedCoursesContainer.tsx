import { useMemo } from "react";
import FeaturedCoursesComponent from "./FeaturedCoursesComponent";
import { toFeaturedCourse } from "../../../apis/mappers";
import { useFeaturedCourses } from "../../../hooks/academyHooks/useCoursesApi";

function FeaturedCoursesContainer() {
  const { data, loading, error, reload } = useFeaturedCourses(3);
  const courses = useMemo(() => (data ?? []).map(toFeaturedCourse), [data]);

  return (
    <FeaturedCoursesComponent
      courses={courses}
      loading={loading && !data}
      errorMessage={error?.message}
      onRetry={reload}
    />
  );
}

export default FeaturedCoursesContainer;
