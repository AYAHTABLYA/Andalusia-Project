type CatalogCourse = {
  id: number;
  slug: string;
  title: string;
  category: string;
  type: string;
  duration: string;
  mentor: string;
  role: string;
  tuition: string;
  seats: string;
  link: string;
  image?: string; // thumbnail, undefined when the item has none
};

export type { CatalogCourse };
