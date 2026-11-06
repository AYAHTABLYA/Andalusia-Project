type Testimonial = {
  id: number;
  quote: string;
  name: string;
  initials: string;
  track: string;
  // 1-5, drives how many stars are filled
  rating: number;
  // Avatar colour variant, see .testimonials_avatar--* in the style file
  tone: "terracotta" | "charcoal" | "sand" | "slate";
};

export type { Testimonial };
