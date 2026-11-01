import type { HeroSlide } from "../../../Types/HeroSlide";
import coverImage from "../../../assets/andalusiahealth_cover.jpg";
import hospitalImage from "../../../assets/andalusia-hospital.webp";
import campusImage from "../../../assets/andalusia-2.webp";

/** Time each slide stays on screen before moving to the next one. */
const HERO_AUTOPLAY_MS = 6000;

/** Minimum horizontal swipe (px) on touch screens to change slide. */
const HERO_SWIPE_THRESHOLD = 50;

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    variant: "cover",
    image: coverImage,
    kicker: "Welcome to Andalusia Academy",
    title: [
      { text: "Shape Your Future with" },
      { text: "Industry-Certified", accent: true },
      { text: "Mastery &" },
      { text: "Offline Cohorts", accent: true },
    ],
    description:
      "Andalusia Academy bridges executive acumen with rigorous hands-on technical bootcamps. Access accredited blended programs, peer-driven offline studios at Alexandria Campus, and mentor-verified portfolios.",
  },
  {
    id: 2,
    variant: "photo",
    image: hospitalImage,
    kicker: "Andalusia Hospital",
    title: [
      { text: "Learn with" },
      { text: "Andalusia Health", accent: true },
    ],
    description:
      "Andalusia Academy is part of the Andalusia Health family, bringing real healthcare expertise into every program.",
    cta: { label: "Explore Programs", to: "/programs" },
  },
  {
    id: 3,
    variant: "photo",
    image: campusImage,
    kicker: "Andalusia Campus",
    title: [
      { text: "A Campus Built Around" },
      { text: "Wellbeing", accent: true },
    ],
    description:
      "Modern, welcoming spaces designed for focused learning and hands-on practice.",
    cta: { label: "Contact Us", to: "#contact-campus" },
  },
];

export { HERO_SLIDES, HERO_AUTOPLAY_MS, HERO_SWIPE_THRESHOLD };
