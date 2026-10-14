import useApi from "../academyHooks/useApi";
import { getProfile } from "../../apis/portalApi";
import { toProfile } from "../../apis/portalMappers";
import type { ProfileData } from "../../Types/Profile";

// GET /api/profile
function useProfile() {
  return useApi<ProfileData>(async (signal) => toProfile(await getProfile(signal)), []);
}

export default useProfile;
