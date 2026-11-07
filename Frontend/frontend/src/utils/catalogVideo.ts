import type { CatalogVideo, ProgramVideo } from "../Types/CatalogVideo";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

// Finds the intro video of a program by its title (or slug).
// Returns undefined when the program has none, so the page simply shows no player.
function getProgramVideo(videos: CatalogVideo[], title: string, slug?: string): ProgramVideo | undefined {
  const candidates = [normalize(title), slug ? normalize(slug) : ""].filter(Boolean);
  for (const candidate of candidates) {
    const hit = videos.find((video) => candidate.includes(video.key));
    if (hit) {
      return {
        src: `/videos/programs/${hit.file}.mp4`,
        captionsAr: `/videos/programs/${hit.file}.ar.vtt`,
      };
    }
  }
  return undefined;
}

export { getProgramVideo };
