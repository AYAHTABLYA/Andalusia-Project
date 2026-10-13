type WorkspaceTab = {
  to: string;
  label: string;
  icon: string;
  badge?: string;
};

// Order = order in the secondary navigation bar.
const WORKSPACE_TABS: WorkspaceTab[] = [
  { to: "/profile", label: "Learner Profile & Settings", icon: "account_circle" },
  { to: "/payments", label: "Payments & Ledger", icon: "account_balance_wallet" },
];

export type { WorkspaceTab };
export { WORKSPACE_TABS };
