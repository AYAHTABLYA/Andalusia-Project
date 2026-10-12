import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopBarComponent from "./TopBar/Topbarcomponent";
import NavbarComponent from "./Navbar/NavbarComponent";
import HeroComponent from "./Hero/HeroComponent";
import CareerPathContainer from "./CareerPath/CareerPathContainer";
import FeaturedCoursesContainer from "./FeaturedCourses/FeaturedCoursesContainer";
import EnterpriseComponent from "./Enterprise/EnterpriseComponent";
import AccreditationsContainer from "./Accreditations/AccreditationsContainer";
import PortalPreviewContainer from "./PortalPreview/PortalPreviewContainer";
import ContactCampusContainer from "./ContactCampus/ContactCampusContainer";
import FooterComponent from "./Footer/FooterComponent";
import "./theme.css";

function LandingPage() {
  // Lets links like /#contact-campus (from the Academy pages) scroll to the section.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <div className="landing-page">
      <TopBarComponent />
      <NavbarComponent />
      <main>
        <HeroComponent />
        <CareerPathContainer />
        <FeaturedCoursesContainer />
        <EnterpriseComponent />
        <AccreditationsContainer />
        <PortalPreviewContainer />
        <ContactCampusContainer />
      </main>
      <FooterComponent />
    </div>
  );
}

export default LandingPage;
