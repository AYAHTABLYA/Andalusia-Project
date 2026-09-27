import { useState } from "react";
import type { PortalTab } from "../types/PortalTab";

function usePortalPreview() {
  const [activeTab, setActiveTab] = useState<PortalTab>("learner");

  function switchPortalTab(tab: PortalTab) {
    setActiveTab(tab);
  }

  return { activeTab, switchPortalTab };
}

export default usePortalPreview;
