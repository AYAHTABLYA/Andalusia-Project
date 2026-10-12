import TopBarComponent from "./TopBar/Topbarcomponent";
import NavbarContainer from "./Navbar/NavbarContainer";
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
      <NavbarContainer />
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
