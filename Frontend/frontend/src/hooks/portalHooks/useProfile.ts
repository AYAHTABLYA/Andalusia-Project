import { getStoredUser } from "../../utils/session";
import type { ProfileData } from "../../Types/Profile";
import useApi from "../academyHooks/useApi";
import { MOCK_PROFILE } from "./mockData";

// Name / email / id come from the logged-in session; the rest is sample data.
// TODO: replace the body with  apiGet<ProfileData>("/api/profile", undefined, signal)
function useProfile() {
  return useApi<ProfileData>(() => {
    const user = getStoredUser();
    if (!user) return Promise.resolve(MOCK_PROFILE);

    const [firstName = "", ...rest] = user.name.trim().split(/\s+/);
    return Promise.resolve<ProfileData>({
      ...MOCK_PROFILE,
      firstName,
      lastName: rest.join(" "),
      email: user.email,
      studentId: `#AA-${String(user.id).padStart(4, "0")}`,
    });
  }, []);
}

export default useProfile;
