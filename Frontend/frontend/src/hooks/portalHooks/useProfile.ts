import useApi from "../academyHooks/useApi";
import { getProfile } from "../../apis/portalApi";
import { toProfile } from "../../apis/portalMappers";
import type { ProfileData } from "../../Types/Profile";

// GET /api/profile
function useProfile() {
<<<<<<< HEAD
  return useApi<ProfileData>(async (signal) => toProfile(await getProfile(signal)), []);
=======
  return useApi<ProfileData>(() => {
    const user = getStoredUser();
    if (!user) return Promise.resolve(MOCK_PROFILE);

    const [firstName = "", ...rest] = (user.name ?? "").trim().split(/\s+/);
    return Promise.resolve<ProfileData>({
      ...MOCK_PROFILE,
      firstName,
      lastName: rest.join(" "),
      email: user.email,
      studentId: `#AA-${String(user.id ?? 0).padStart(4, "0")}`,
    });
  }, []);
>>>>>>> bd275f9a140e4655f316ed5e17a7ac76bea524ac
}

export default useProfile;
