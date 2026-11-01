import { Outlet } from "react-router-dom";
import useSessionUser from "../../../hooks/portalHooks/useSessionUser";
import useWorkspaceData from "../../../hooks/workspaceHooks/useWorkspaceData";
import type { WorkspaceOutletContext } from "../../../Types/Workspace";
import WorkspaceLayoutComponent from "./WorkspaceLayoutComponent";
import { WORKSPACE_LINKS } from "./constants";

// "My Workspace": the learner's day-to-day learning area. Loads the workspace data once
// (active enrollments only, straight from the API) and shares it with the pages through <Outlet context />.
function WorkspaceLayoutContainer() {
  const user = useSessionUser();
  const userName = user?.name || "Student";
  const workspace = useWorkspaceData();

  const today = new Date().toDateString();
  const todaySessions = workspace.sessions.filter((s) => new Date(s.start).toDateString() === today).length;
  const badges: Record<string, number> = { "/workspace/schedule": todaySessions };

  const context: WorkspaceOutletContext = { workspace, userName };

  return (
    <WorkspaceLayoutComponent
      links={WORKSPACE_LINKS}
      badges={badges}
      userName={userName}
      error={workspace.error}
      warning={workspace.warning}
      onRetry={workspace.reload}
    >
      <Outlet context={context} />
    </WorkspaceLayoutComponent>
  );
}

export default WorkspaceLayoutContainer;
