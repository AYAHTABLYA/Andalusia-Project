import { useState } from "react";
import type { PortalTab } from "../Types/PortalTab";

function usePortalPreview() {
  const [activeTab, setActiveTab] = useState<PortalTab>("student");

  function switchPortalTab(tab: PortalTab) {
    setActiveTab(tab);
  }

  return { activeTab, switchPortalTab };
}

export default usePortalPreview;
