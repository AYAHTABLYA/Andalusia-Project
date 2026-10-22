import PortalPreviewComponent from "./PortalPreviewComponent";
import usePortalPreview from "../../../hooks/usePortalPreview";

function PortalPreviewContainer() {
  const { activeTab, switchPortalTab } = usePortalPreview();

  return (
    <PortalPreviewComponent activeTab={activeTab} switchPortalTab={switchPortalTab} />
  );
}

export default PortalPreviewContainer;
