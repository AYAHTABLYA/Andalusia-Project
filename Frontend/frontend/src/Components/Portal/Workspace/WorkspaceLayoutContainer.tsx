import { Outlet } from "react-router-dom";
import useSessionUser from "../../../hooks/portalHooks/useSessionUser";
import useWorkspaceData from "../../../hooks/workspaceHooks/useWorkspaceData";
import { resolveAssetUrl } from "../../../utils/format";
import type { WorkspaceOutletContext } from "../../../Types/Workspace";
import WorkspaceLayoutComponent from "./WorkspaceLayoutComponent";

// "My Workspace": the learner's day-to-day learning area. Loads the workspace data once
// (active enrollments only, straight from the API) and shares it with the pages through <Outlet context />.
// Navigation is provided by StudentLayout, so this only owns the data.
function WorkspaceLayoutContainer() {
  const user = useSessionUser();
  const userName = user?.name || "Student";
  const workspace = useWorkspaceData();

  const context: WorkspaceOutletContext = {
    workspace,
    userName,
    email: user?.email,
    photoUrl: resolveAssetUrl(user?.photoUrl),
  };

  return (
    <WorkspaceLayoutComponent error={workspace.error} warning={workspace.warning} onRetry={workspace.reload}>
      <Outlet context={context} />
    </WorkspaceLayoutComponent>
  );
}

export default WorkspaceLayoutContainer;
