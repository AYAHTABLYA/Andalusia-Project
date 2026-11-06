import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import useAccountLink from "../../../hooks/userHooks/useAccountLink";

function NavbarContainer() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { accountPath } = useAccountLink();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <NavbarComponent
      accountPath={accountPath}
      menuOpen={menuOpen}
      onToggleMenu={() => setMenuOpen((v) => !v)}
      onCloseMenu={() => setMenuOpen(false)}
    />
  );
}

export default NavbarContainer;
