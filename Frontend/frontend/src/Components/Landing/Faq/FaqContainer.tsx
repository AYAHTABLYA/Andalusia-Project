import { useMemo } from "react";
import FaqComponent from "./FaqComponent";
import { toFaqItem } from "../../../apis/mappers";
import { useFaqs } from "../../../hooks/academyHooks/useContentApi";

// Keep the section short: only the first few questions (in the admin's display order).
// The support bot covers the rest.
const FAQ_LIMIT = 5;

function FaqContainer() {
  const { data, loading, error, reload } = useFaqs(true);
  const items = useMemo(
    () => (data ?? []).slice(0, FAQ_LIMIT).map(toFaqItem),
    [data],
  );

  return (
    <FaqComponent
      items={items}
      loading={loading && !data}
      errorMessage={error?.message}
      onRetry={reload}
    />
  );
}

export default FaqContainer;
