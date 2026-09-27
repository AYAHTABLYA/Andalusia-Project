import AccreditationsComponent from "./AccreditationsComponent";
import { ACCREDITATIONS } from "./constants";

function AccreditationsContainer() {
  return <AccreditationsComponent accreditations={ACCREDITATIONS} />;
}

export default AccreditationsContainer;
