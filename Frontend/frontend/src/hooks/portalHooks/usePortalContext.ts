import { useOutletContext } from "react-router-dom";
import type { PortalOutletContext } from "../../Types/PortalContext";

// Typed access to what PortalLayout shares with the pages rendered in its <Outlet />.
function usePortalContext() {
  return useOutletContext<PortalOutletContext>();
}

export default usePortalContext;
