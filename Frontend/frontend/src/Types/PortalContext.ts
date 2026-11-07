import type { PaymentsState } from "./Payment";

// Passed from PortalLayout to its child pages through <Outlet context />.
type PortalOutletContext = {
  showToast: (message: string) => void;
  payments: PaymentsState;
};

export type { PortalOutletContext };
