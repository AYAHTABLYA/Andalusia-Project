import { useMemo } from "react";
import FaqComponent from "./FaqComponent";
import { toFaqItem } from "../../../apis/mappers";
import { useFaqs } from "../../../hooks/academyHooks/useContentApi";

function FaqContainer() {
  const { data, loading, error, reload } = useFaqs(true);
  const items = useMemo(() => (data ?? []).map(toFaqItem), [data]);

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
