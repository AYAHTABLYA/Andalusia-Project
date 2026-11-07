import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopBarComponent from "./TopBar/Topbarcomponent";
import NavbarContainer from "./Navbar/NavbarContainer";
import HeroContainer from "./Hero/HeroContainer";
import ValuePillarsContainer from "./ValuePillars/ValuePillarsContainer";
import PopularCategoriesContainer from "./PopularCategories/PopularCategoriesContainer";
import FeaturedCoursesContainer from "./FeaturedCourses/FeaturedCoursesContainer";
import ComingSoonContainer from "./ComingSoon/ComingSoonContainer";
import CareerPathContainer from "./CareerPath/CareerPathContainer";
import PortalPreviewContainer from "./PortalPreview/PortalPreviewContainer";
import AccreditationsContainer from "./Accreditations/AccreditationsContainer";
import PartnersContainer from "./Partners/PartnersContainer";
import EnterpriseComponent from "./Enterprise/EnterpriseComponent";
import TestimonialsContainer from "./Testimonials/TestimonialsContainer";
import FaqContainer from "./Faq/FaqContainer";
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
      <NavbarContainer />
      <main>
        <HeroContainer />
        <ValuePillarsContainer />
        <PopularCategoriesContainer />
        <FeaturedCoursesContainer />
        <ComingSoonContainer />
        <CareerPathContainer />
        <PortalPreviewContainer />
        <AccreditationsContainer />
        <PartnersContainer />
        <EnterpriseComponent />
        <TestimonialsContainer />
        <FaqContainer />
        <ContactCampusContainer />
      </main>
      <FooterComponent />
    </div>
  );
}

export default LandingPage;
