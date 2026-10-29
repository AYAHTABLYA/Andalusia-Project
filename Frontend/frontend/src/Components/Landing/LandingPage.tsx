import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopBarComponent from "./TopBar/Topbarcomponent";
import NavbarContainer from "./Navbar/NavbarContainer";
import HeroComponent from "./Hero/HeroComponent";
import ValuePillarsContainer from "./ValuePillars/ValuePillarsContainer";
import AccreditationsContainer from "./Accreditations/AccreditationsContainer";
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
        <HeroComponent />
        <ValuePillarsContainer />
        <AccreditationsContainer />
        <TestimonialsContainer />
        <FaqContainer />
        <ContactCampusContainer />
      </main>
      <FooterComponent />
    </div>
  );
}

export default LandingPage;
