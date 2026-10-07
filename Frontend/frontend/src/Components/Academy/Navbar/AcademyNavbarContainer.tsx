import { useState } from "react";
import { useLocation } from "react-router-dom";
import AcademyNavbarComponent from "./AcademyNavbarComponent";

function AcademyNavbarContainer() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AcademyNavbarComponent
      currentPath={pathname}
      menuOpen={menuOpen}
      onToggleMenu={() => setMenuOpen((v) => !v)}
      onCloseMenu={() => setMenuOpen(false)}
    />
  );
}

export default AcademyNavbarContainer;
