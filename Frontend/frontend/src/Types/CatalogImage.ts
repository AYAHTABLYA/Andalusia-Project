type CatalogImage = {
  key: string; // normalized part of the title used for matching
  file: string; // file name inside public/images/<programs|courses>/
  url: string; // hosted thumbnail (fallback until the files are saved locally)
};

export type { CatalogImage };
