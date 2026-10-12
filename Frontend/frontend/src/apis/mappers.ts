// API DTO -> UI model mappers (keeps the presentational components unchanged in shape).
import type {
  CareerPathListItemDto,
  CourseListItemDto,
  FeaturedCourseDto,
  ProgramListItemDto,
} from "../Types/AcademyApi";
import type { CareerPath } from "../Types/CareerPath";
import type { CatalogCourse } from "../Types/CatalogCourse";
import type { Course } from "../Types/Course";
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

export { toCareerPath, toProgram, toCatalogCourse, toFeaturedCourse };
