import PartnersComponent from "./PartnersComponent";
import { usePartners } from "../../../hooks/academyHooks/usePartnersApi";

// Hiring / success partners from GET /api/partners?type=Success_Partner.
function PartnersContainer() {
  const { data } = usePartners("Success_Partner");

  // Loading, failed or empty: render nothing rather than a broken section.
  if (!data || data.length === 0) return null;

  return <PartnersComponent partners={data} />;
}

export default PartnersContainer;
