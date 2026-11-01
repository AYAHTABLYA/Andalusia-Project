import { useState } from "react";
import { useLocation } from "react-router-dom";
import AcademyNavbarComponent from "./AcademyNavbarComponent";
import { NAV_LINKS } from "./constants";
import useCareerPathCount from "../../../hooks/academyHooks/useCareerPathCount";

function AcademyNavbarContainer() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const careerPathCount = useCareerPathCount();

  const links = NAV_LINKS.map((link) =>
    link.to === "/career-paths" && careerPathCount
      ? { ...link, badge: `${careerPathCount} ${careerPathCount === 1 ? "Path" : "Paths"}` }
      : link,
  );

  return (
    <AcademyNavbarComponent
      links={links}
      currentPath={pathname}
      menuOpen={menuOpen}
      onToggleMenu={() => setMenuOpen((v) => !v)}
      onCloseMenu={() => setMenuOpen(false)}
    />
  );
}

export default AcademyNavbarContainer;
