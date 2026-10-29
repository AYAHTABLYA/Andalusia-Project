import FaqComponent from "./FaqComponent";
import { FAQ_ITEMS } from "./constants";

function FaqContainer() {
  return <FaqComponent items={FAQ_ITEMS} />;
}

export default FaqContainer;
