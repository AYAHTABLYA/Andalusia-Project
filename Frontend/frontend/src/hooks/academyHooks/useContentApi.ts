import { apiGet } from "../../apis/academyApi";
import type {
  FaqDto,
  RatingSummaryDto,
  TestimonialDto,
} from "../../Types/AcademyApi";
import useApi from "./useApi";

// GET /api/testimonials?featured=true&take=4  (newest first)
function useTestimonials(featured = true, take = 4) {
  return useApi<TestimonialDto[]>(
    (signal) => apiGet("/api/testimonials", { featured, take }, signal),
    [featured, take],
  );
}

// GET /api/ratings/summary  (average + number of ratings)
function useRatingSummary() {
  return useApi<RatingSummaryDto>(
    (signal) => apiGet("/api/ratings/summary", undefined, signal),
    [],
  );
}

// GET /api/faqs?general=true  (general FAQs only, in display order)
function useFaqs(general = true) {
  return useApi<FaqDto[]>(
    (signal) => apiGet("/api/faqs", { general }, signal),
    [general],
  );
}

export { useTestimonials, useRatingSummary, useFaqs };
