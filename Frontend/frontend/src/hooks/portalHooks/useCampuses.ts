import useApi from "../academyHooks/useApi";
import { getCampuses } from "../../apis/portalApi";
import { toCampusOptions } from "../../apis/portalMappers";
import type { CampusOption } from "../../Types/Profile";

// GET /api/campuses (public) -> options for the edit-profile dropdown
function useCampuses() {
  return useApi<CampusOption[]>(async (signal) => toCampusOptions(await getCampuses(signal)), []);
}

export default useCampuses;
