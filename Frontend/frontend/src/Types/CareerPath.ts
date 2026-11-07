type CareerPath = {
  id: number;
  slug: string;
  title: string;
  roles: string;
  summary: string;
  duration: string;
  credits: string; // empty string when the API has no credits value
  diplomas: string;
  courses: string;
  tuition: string;
  status: string;
  pathUrl: string;
  domain: string;
};

export type { CareerPath };
