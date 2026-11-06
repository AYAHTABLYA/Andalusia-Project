type CatalogVideo = {
  key: string; // normalized part of the title used for matching
  file: string; // base name inside public/videos/programs/ (<file>.mp4 + <file>.ar.vtt)
};

type ProgramVideo = {
  src: string; // MP4 with English voice-over
  captionsAr: string; // WebVTT with the Arabic translation
};

export type { CatalogVideo, ProgramVideo };
