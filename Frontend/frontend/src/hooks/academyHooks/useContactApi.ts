import { apiPost } from "../../apis/academyApi";
import type {
  ContactEnquiryReceiptDto,
  CreateContactEnquiryBody,
} from "../../Types/AcademyApi";

// POST /api/contact-enquiries  (public; the JWT is attached automatically when signed in)
function submitContactEnquiry(body: CreateContactEnquiryBody) {
  return apiPost<ContactEnquiryReceiptDto>("/api/contact-enquiries", body);
}

export { submitContactEnquiry };
