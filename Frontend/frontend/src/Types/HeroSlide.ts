export type HeroTitlePart = {
  text: string;
  /** Rendered in the brand colour (like "Industry-Certified" in the original hero). */
  accent?: boolean;
};

export type HeroSlideCta = {
  label: string;
  /** "/programs" is a router link, "#contact-campus" is an in-page anchor. */
  to: string;
};

export type HeroSlide = {
  id: number;
  /**
   * cover = the original light, washed-out hero (unchanged).
   * photo = a full photo with a blurred panel on the start side and a clear end side.
   */
  variant: "cover" | "photo";
  image: string;
  kicker: string;
  title: HeroTitlePart[];
  description: string;
  cta?: HeroSlideCta;
};
