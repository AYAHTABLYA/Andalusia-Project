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
   * cover = light hero: text on the start side, the artwork already sits on the end side of the picture.
   * photo = a full photo with a blurred panel on the start side and a clear end side.
   */
  variant: "cover" | "photo";
  /** Background picture: the full cover art (cover) or a photo behind the blurred panel (photo). */
  image: string;
  kicker: string;
  title: HeroTitlePart[];
  description: string;
  /** Small dotted highlights under the description (cover slide). */
  features?: string[];
  cta?: HeroSlideCta;
};
