import { useMemo } from "react";
import FeaturedCoursesComponent from "../FeaturedCourses/FeaturedCoursesComponent";
import { toFeaturedCourse } from "../../../apis/mappers";
import { useComingSoonCourses } from "../../../hooks/academyHooks/useCoursesApi";

// Courses with a scheduled cohort that has not started yet (GET /api/courses/coming-soon).
function ComingSoonContainer() {
  const { data, loading, error, reload } = useComingSoonCourses(3);
  const courses = useMemo(() => (data ?? []).map(toFeaturedCourse), [data]);

  // Nothing is scheduled yet: hide the section instead of showing an empty block.
  if (!loading && !error && courses.length === 0) return null;

  return (
    <FeaturedCoursesComponent
      id="coming-soon"
      kicker="Coming Soon"
      title="New Cohorts Opening Soon"
      courses={courses}
      loading={loading && !data}
      errorMessage={error?.message}
      onRetry={reload}
    />
  );
}

export default ComingSoonContainer;
