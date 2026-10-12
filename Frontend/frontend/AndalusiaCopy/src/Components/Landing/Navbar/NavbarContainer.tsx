import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";

function NavbarContainer() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <NavbarComponent
      menuOpen={menuOpen}
      onToggleMenu={() => setMenuOpen((v) => !v)}
      onCloseMenu={() => setMenuOpen(false)}
    />
  );
}

export default NavbarContainer;
