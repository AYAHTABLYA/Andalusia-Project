import type { HeroSlide } from "../../../Types/HeroSlide";
import coverImage from "../../../assets/andalusia-health-cover.webp";
import hospitalImage from "../../../assets/andalusia-hospital.webp";
import campusImage from "../../../assets/andalusia-2.webp";

/** Time each slide stays on screen before moving to the next one. */
const HERO_AUTOPLAY_MS = 4500;

/** Minimum horizontal swipe (px) on touch screens to change slide. */
const HERO_SWIPE_THRESHOLD = 50;

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 2,
    variant: "photo",
    image: hospitalImage,
    kicker: "Andalusia Hospital",
    title: [{ text: "Learn with" }, { text: "Andalusia Health", accent: true }],
    description:
      "Andalusia Academy delivers practical, industry-driven education across diverse fields, from technology and creative industries to healthcare and beyond. Through hands-on training, expert mentorship, and career-focused programs, we equip learners with the skills and confidence to thrive in an evolving professional world.",
  },
  {
    id: 3,
    variant: "photo",
    image: campusImage,
    kicker: "Andalusia Campus",
    title: [
      { text: "A Legacy of Excellence." },
      { text: "A Vision for Growth.", accent: true },
    ],
    description:
      "Established in 1984, Andalusia Group has grown into a leading regional healthcare provider across Egypt and Saudi Arabia. Built on decades of experience, innovation, and a commitment to excellence, the Group continues to expand its impact and create opportunities that shape a better future.",
  },
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
    features: ["1:12 Mentor Ratio", "Pearson Assured", "Gleem District Campus"],
  },
];

export { HERO_SLIDES, HERO_AUTOPLAY_MS, HERO_SWIPE_THRESHOLD };
