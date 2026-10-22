/* ---------- Career paths ---------- */
type CareerPathListItemDto = {
  id: number;
  slug: string;
  title: string;
  roles: string;
  summary: string;
  duration: string;
  credits?: number;
  diplomasCount: number;
  coursesCount: number;
  tuition: number;
  currency: string;
  status: string;
  domain: string;
  pathUrl: string;
};

type CareerPathHighlightDto = {
  label: string;
  value?: string;
  tone: string;
};

type CareerPathCourseDto = {
  id: number;
  slug: string;
  title: string;
  description: string;
  duration: string;
  orderIndex: number;
  link?: string;
};

type CareerPathProgramDto = {
  id: number;
  slug: string;
  title: string;
  duration: string;
  tuition: number;
  currency: string;
  coursesCount: number;
  description: string;
  orderIndex: number;
  courses: CareerPathCourseDto[];
};

type CareerPathDetailDto = {
  id: number;
  slug: string;
  title: string;
  roles: string;
  summary: string;
  status: string;
  domain: string;
  duration: string;
  credits?: number;
  tuition: number;
  currency: string;
  highlights: CareerPathHighlightDto[];
  guarantees: string[];
  programs: CareerPathProgramDto[];
  syllabusUrl: string;
};

/* ---------- Programs ---------- */
type ProgramListItemDto = {
  id: number;
  slug: string;
  title: string;
  category: string;
  duration: string;
  coursesCount: number;
  tuition: number;
  currency: string;
  accreditation: string;
  cohortDate?: string;
  status: string;
  link: string;
};

type ProgramCategoryDto = {
  categoryId: number;
  name: string;
  slug: string;
  isTrending: boolean;
};

type ProgramStatsDto = {
  duration: string;
  level?: string;
  accreditation: string;
  campus?: string;
};

type ProgramCourseDto = {
  id: number;
  slug: string;
  title: string;
  description: string;
  duration: string;
  orderIndex: number;
  link?: string;
};

type ProgramPartnerDto = {
  partnerId: number;
  name: string;
  logoUrl: string;
  accreditationDetails: string;
};

type ProgramDetailDto = {
  id: number;
  slug: string;
  title: string;
  overview: string;
  requirements: string;
  structure: string;
  status: string;
  tuition: number;
  currency: string;
  tuitionNote?: string;
  stats: ProgramStatsDto;
  category: ProgramCategoryDto;
  careerPath?: { id: number; slug: string; title: string };
  courses: ProgramCourseDto[];
  partners: ProgramPartnerDto[];
  benefits: { text: string }[];
  relatedPrograms: ProgramListItemDto[];
  syllabusAvailable: boolean;
  syllabusUrl: string;
};

type ProgramApplicationResponseDto = {
  applicationId: number;
  programSlug: string;
  status: string;
  submissionDate: string;
};

/* ---------- Courses ---------- */
type CourseListItemDto = {
  id: number;
  slug: string;
  title: string;
  category: string;
  type: string;
  duration: string;
  mentor: string;
  role: string;
  tuition: number;
  currency: string;
  seats: string;
};

type FeaturedCourseDto = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  modeLabel: string;
  modeVariant: string;
  nextBatch: string;
  hall: string;
  duration: string;
  mentor: string;
  instructorTitle: string;
  tuition: number;
  seats: string;
};

type CourseDetailDto = {
  slug: string;
  title: string;
  description: string;
  statusLabel: string;
  stats: {
    duration: string;
    level: string;
    accreditation: string;
    cohortStart: string;
  };
  learnItems: { title: string; text: string }[];
  mentor: { name: string; title: string; bio: string };
  enroll: {
    tuition: number;
    currency: string;
    note: string;
    bullets: string[];
  };
  program?: { slug: string; title: string };
  careerPath?: { slug: string; title: string };
};

type CreateCourseApplicationBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
};

type CourseApplicationResponseDto = {
  applicationId: number;
  status: string;
};

export type {
  CareerPathListItemDto,
  CareerPathHighlightDto,
  CareerPathCourseDto,
  CareerPathProgramDto,
  CareerPathDetailDto,
  ProgramListItemDto,
  ProgramCategoryDto,
  ProgramStatsDto,
  ProgramCourseDto,
  ProgramPartnerDto,
  ProgramDetailDto,
  ProgramApplicationResponseDto,
  CourseListItemDto,
  FeaturedCourseDto,
  CourseDetailDto,
  CreateCourseApplicationBody,
  CourseApplicationResponseDto,
};
