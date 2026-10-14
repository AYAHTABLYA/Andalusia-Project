import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import { isLoggedIn } from "../../../apis/academyApi";

function NavbarContainer() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <NavbarComponent
      signedIn={isLoggedIn()}
      menuOpen={menuOpen}
      onToggleMenu={() => setMenuOpen((v) => !v)}
      onCloseMenu={() => setMenuOpen(false)}
    />
  );
}

export default NavbarContainer;
