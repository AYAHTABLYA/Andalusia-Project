import { apiGet } from "../../apis/academyApi";
import type { PartnerDto } from "../../Types/AcademyApi";
import useApi from "./useApi";

// GET /api/partners?type=Accreditation|Success_Partner
function usePartners(type?: PartnerDto["type"]) {
  return useApi<PartnerDto[]>(
    (signal) => apiGet("/api/partners", { type }, signal),
    [type],
  );
}

export { usePartners };
