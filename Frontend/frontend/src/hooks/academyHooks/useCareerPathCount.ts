import { apiGet } from "../../apis/academyApi";
import type { Paginated } from "../../Types/Paginated";
import type { CareerPathListItemDto } from "../../Types/AcademyApi";
import useApi from "./useApi";

// Total number of career paths (used by the navbar badge).
function useCareerPathCount(): number | null {
  const { data } = useApi<Paginated<CareerPathListItemDto>>(
    (signal) => apiGet("/api/career-paths", { page: 1, pageSize: 1 }, signal),
    [],
  );
  return data ? data.count : null;
}

export default useCareerPathCount;
