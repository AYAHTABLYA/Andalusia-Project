import TopBarComponent from "./TopBar/TopBarComponent";
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
