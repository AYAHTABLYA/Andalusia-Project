type Program = {
  id: number;
  slug: string;
  title: string;
  category: string;
  duration: string;
  coursesCount: number;
  tuition: string;
  accreditation: string;
  cohortDate: string; // empty string when no upcoming cohort
  status: string;
  link: string;
  image?: string; // thumbnail, undefined when the item has none
};

export type { Program };
