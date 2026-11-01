import { useLocation } from "react-router-dom";
import WorkspaceNavComponent from "./WorkspaceNavComponent";
import { WORKSPACE_TABS } from "./constants";

function WorkspaceNavContainer({ dueCount }: { dueCount: number }) {
  const { pathname } = useLocation();

  const tabs = WORKSPACE_TABS.map((tab) =>
    tab.to === "/payments" && dueCount > 0 ? { ...tab, badge: `${dueCount} Due` } : tab,
  );

  return <WorkspaceNavComponent tabs={tabs} currentPath={pathname} />;
}

export default WorkspaceNavContainer;
