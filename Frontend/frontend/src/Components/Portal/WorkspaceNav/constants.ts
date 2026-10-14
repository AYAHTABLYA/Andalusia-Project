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
  { to: "/applications", label: "My Applications", icon: "description" },
  { to: "/enrollments", label: "My Enrollments", icon: "school" },
];

export type { WorkspaceTab };
export { WORKSPACE_TABS };
