type Testimonial = {
  id: number;
  quote: string;
  name: string;
  initials: string;
  track: string;
  // Avatar colour variant, see .testimonials_avatar--* in the style file
  tone: "terracotta" | "charcoal" | "sand" | "slate";
};

export type { Testimonial };
