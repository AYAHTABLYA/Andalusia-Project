import { useMemo } from "react";
import TestimonialsComponent from "./TestimonialsComponent";
import { toTestimonial } from "../../../apis/mappers";
import {
  useRatingSummary,
  useTestimonials,
} from "../../../hooks/academyHooks/useContentApi";

function TestimonialsContainer() {
  const { data, loading, error, reload } = useTestimonials(true, 4);
  const { data: summary } = useRatingSummary();
  const testimonials = useMemo(() => (data ?? []).map(toTestimonial), [data]);

  return (
    <TestimonialsComponent
      testimonials={testimonials}
      averageRating={summary && summary.totalCount > 0 ? summary.averageRating : null}
      ratingsCount={summary?.totalCount ?? 0}
      loading={loading && !data}
      errorMessage={error?.message}
      onRetry={reload}
    />
  );
}

export default TestimonialsContainer;
