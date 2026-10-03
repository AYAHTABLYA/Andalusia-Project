import FeaturedCoursesComponent from "./FeaturedCoursesComponent";
import { FEATURED_COURSES } from "./constants";

function FeaturedCoursesContainer() {
  return <FeaturedCoursesComponent courses={FEATURED_COURSES} />;
}

export default FeaturedCoursesContainer;
