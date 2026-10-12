type HeaderLink = { to: string; label: string };

const HEADER_LINKS: HeaderLink[] = [
  { to: "/career-paths", label: "Career Paths" },
  { to: "/programs", label: "Programs" },
  { to: "/courses", label: "Courses" },
];

export type { HeaderLink };
export { HEADER_LINKS };
