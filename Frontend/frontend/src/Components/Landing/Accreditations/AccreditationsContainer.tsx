import { useMemo } from "react";
import AccreditationsComponent from "./AccreditationsComponent";
import { ACCREDITATIONS } from "./constants";
import type { Accreditation } from "../../../Types/Accreditation";
import { usePartners } from "../../../hooks/academyHooks/usePartnersApi";

// Accreditation partners come from GET /api/partners?type=Accreditation. The static list in constants.ts is
// kept for memberships that are not stored as partners (and as the fallback while loading / if the API fails);
// entries the API already returns are not duplicated.
function AccreditationsContainer() {
  const { data } = usePartners("Accreditation");

  const accreditations = useMemo<Accreditation[]>(() => {
    const fromApi: Accreditation[] = (data ?? []).map((p) => ({
      id: p.partnerId,
      name: p.name,
      label: "Accreditation Partner",
    }));
    const known = fromApi.map((a) => a.name.toLowerCase());
    const extras = ACCREDITATIONS.filter(
      (a) => !known.some((name) => name.includes(a.name.toLowerCase())),
    ).map((a) => ({ ...a, id: 1000 + a.id }));
    return [...fromApi, ...extras];
  }, [data]);

  return <AccreditationsComponent accreditations={accreditations} />;
}

export default AccreditationsContainer;
