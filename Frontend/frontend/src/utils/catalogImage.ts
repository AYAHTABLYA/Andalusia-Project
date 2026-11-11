import type { CatalogImage } from "../Types/CatalogImage";
import { FEATURES } from "./features";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

// Finds the thumbnail of a program / course by its title (or slug).
// Returns undefined when there is none, so the card simply has no banner.
function getCatalogImage(
  images: CatalogImage[],
  folder: "programs" | "courses",
  title: string,
  slug?: string,
): string | undefined {
  const candidates = [normalize(title), slug ? normalize(slug) : ""].filter(Boolean);
  for (const candidate of candidates) {
    const hit = images.find((image) => candidate.includes(image.key));
    if (hit) return FEATURES.localImages ? `/images/${folder}/${hit.file}` : hit.url;
  }
  return undefined;
}

export { getCatalogImage };
