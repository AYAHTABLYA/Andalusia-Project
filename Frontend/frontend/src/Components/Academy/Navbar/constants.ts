type NavLinkItem = { to: string; label: string; icon: string; match?: string; badge?: string };

const NAV_LINKS: NavLinkItem[] = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/career-paths", label: "Career Paths", icon: "route", match: "career-path", badge: "4 Paths" },
  { to: "/programs", label: "Programs", icon: "school", match: "program" },
  { to: "/courses", label: "Courses", icon: "menu_book", match: "course" },
];

const SUPPORT_PHONE = "+20 (3) 540-8910";

export type { NavLinkItem };
export { NAV_LINKS, SUPPORT_PHONE };
