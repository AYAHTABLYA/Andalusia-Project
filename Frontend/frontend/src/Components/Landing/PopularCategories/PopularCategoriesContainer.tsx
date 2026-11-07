import PopularCategoriesComponent from "./PopularCategoriesComponent";
import { usePopularCategories } from "../../../hooks/academyHooks/useProgramsApi";

function PopularCategoriesContainer() {
  const { data, loading, error, reload } = usePopularCategories(6);

  // No category has programs yet: hide the section.
  if (!loading && !error && (data ?? []).length === 0) return null;

  return (
    <PopularCategoriesComponent
      categories={data ?? []}
      loading={loading && !data}
      errorMessage={error?.message}
      onRetry={reload}
    />
  );
}

export default PopularCategoriesContainer;
