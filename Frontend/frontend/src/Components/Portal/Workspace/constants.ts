type WorkspaceLink = {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
};

// Order = order in the workspace sidebar.
const WORKSPACE_LINKS: WorkspaceLink[] = [
  { to: "/workspace", label: "Overview", icon: "dashboard", end: true },
  { to: "/workspace/courses", label: "My courses", icon: "menu_book" },
  { to: "/workspace/schedule", label: "My schedule", icon: "calendar_month" },
  { to: "/workspace/assignments", label: "Assignments", icon: "assignment_turned_in" },
  { to: "/workspace/messages", label: "Messages", icon: "chat_bubble" },
];

// Conversation with the academy support team (target of "Talk to support").
const SUPPORT_CONVERSATION_ID = "m-support";

// Sort weight of each assignment status: unfinished first, graded last.
const ASSIGNMENT_ORDER = { Pending: 0, Submitted: 1, Graded: 2 } as const;

export type { WorkspaceLink };
export { WORKSPACE_LINKS, SUPPORT_CONVERSATION_ID, ASSIGNMENT_ORDER };
