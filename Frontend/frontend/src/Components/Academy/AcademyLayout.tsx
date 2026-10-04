import { Outlet } from "react-router-dom";
import AcademyNavbarContainer from "./Navbar/AcademyNavbarContainer";
import AcademyFooterComponent from "./Footer/AcademyFooterComponent";
import "./theme.css";

function AcademyLayout() {
  return (
    <div className="academy">
      <AcademyNavbarContainer />
      <main className="academy_main">
        <Outlet />
      </main>
      <AcademyFooterComponent />
    </div>
  );
}

export default AcademyLayout;
