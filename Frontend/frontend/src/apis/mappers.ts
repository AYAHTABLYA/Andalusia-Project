// API DTO -> UI model mappers (keeps the presentational components unchanged in shape).
import type {
  CareerPathListItemDto,
  CourseListItemDto,
  FaqDto,
  FeaturedCourseDto,
  ProgramListItemDto,
  TestimonialDto,
} from "../Types/AcademyApi";
import type { CareerPath } from "../Types/CareerPath";
import type { CatalogCourse } from "../Types/CatalogCourse";
import type { Course } from "../Types/Course";
import type { FaqAnswerPart, FaqItem } from "../Types/Faq";
import type { Testimonial } from "../Types/Testimonial";
import type { Program } from "../Types/Program";
import { formatMoney, initials } from "../utils/format";

function toCareerPath(dto: CareerPathListItemDto): CareerPath {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    roles: dto.roles,
    summary: dto.summary,
    duration: dto.duration || "—",
    credits: dto.credits != null ? `${dto.credits} Credits` : "",
    diplomas: `${dto.diplomasCount} Programs`,
    courses: `${dto.coursesCount} Courses`,
    tuition: formatMoney(dto.tuition, dto.currency),
    status: dto.status,
    pathUrl: dto.pathUrl || `/career-paths/${dto.slug}`,
    domain: dto.domain,
  };
}

function toProgram(dto: ProgramListItemDto): Program {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    category: dto.category,
    duration: dto.duration,
    coursesCount: dto.coursesCount,
    tuition: formatMoney(dto.tuition, dto.currency),
    accreditation: dto.accreditation,
    cohortDate: dto.cohortDate ?? "",
    status: dto.status,
    link: dto.link || `/programs/${dto.slug}`,
  };
}

function toCatalogCourse(dto: CourseListItemDto): CatalogCourse {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    category: dto.category,
    type: dto.type,
    duration: dto.duration,
    mentor: dto.mentor,
    role: dto.role,
    tuition: formatMoney(dto.tuition, dto.currency),
    seats: dto.seats,
    link: `/courses/${dto.slug}`,
  };
}

function toFeaturedCourse(dto: FeaturedCourseDto): Course {
  const blended = /blend|hybrid/i.test(dto.modeLabel);
  return {
    id: dto.id,
    slug: dto.slug,
    category: dto.category,
    modeLabel: dto.modeLabel,
    modeVariant: blended ? "blended" : "offline",
    title: dto.title,
    description: dto.description,
    nextBatch: dto.nextBatch,
    duration: dto.duration,
    hall: dto.hall,
    instructorInitials: initials(dto.mentor),
    instructorName: dto.mentor,
    instructorTitle: dto.instructorTitle,
    price: formatMoney(dto.tuition, "EGP"),
  };
}

// Avatar colour variants cycle by position (the API has no colour field).
const AVATAR_TONES: Testimonial["tone"][] = ["terracotta", "charcoal", "sand", "slate"];

function toTestimonial(dto: TestimonialDto, index: number): Testimonial {
  return {
    id: dto.testimonialId,
    quote: dto.quoteText,
    name: dto.clientName,
    initials: dto.initials || initials(dto.clientName),
    track: dto.titleOrRole,
    rating: dto.rating,
    tone: AVATAR_TONES[index % AVATAR_TONES.length],
  };
}

// FAQ answers are plain text; **double asterisks** mark the bold parts.
function parseFaqAnswer(answer: string): FaqAnswerPart[] {
  return answer
    .split(/\*\*(.+?)\*\*/g)
    .map((text, i) => ({ text, bold: i % 2 === 1 }))
    .filter((part) => part.text !== "");
}

function toFaqItem(dto: FaqDto): FaqItem {
  return {
    id: dto.faqId,
    question: dto.question,
    answer: parseFaqAnswer(dto.answer),
  };
}

export {
  toCareerPath,
  toProgram,
  toCatalogCourse,
  toFeaturedCourse,
  toTestimonial,
  toFaqItem,
};
