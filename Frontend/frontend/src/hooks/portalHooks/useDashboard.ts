import useApi from "../academyHooks/useApi";
import { getLearnerDashboard } from "../../apis/portalApi";
import { toDashboard } from "../../apis/portalMappers";
import type { LearnerDashboard } from "../../Types/Dashboard";

// GET /api/learner/dashboard
function useDashboard() {
  return useApi<LearnerDashboard>(async (signal) => toDashboard(await getLearnerDashboard(signal)), []);
}

export default useDashboard;
