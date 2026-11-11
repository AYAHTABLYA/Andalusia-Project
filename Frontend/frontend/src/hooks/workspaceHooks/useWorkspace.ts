import { useOutletContext } from "react-router-dom";
import type { WorkspaceOutletContext } from "../../Types/Workspace";

// Typed access to what WorkspaceLayout shares with its pages.
export default function useWorkspace() {
  return useOutletContext<WorkspaceOutletContext>();
}
