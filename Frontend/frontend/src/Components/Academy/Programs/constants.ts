import type { CatalogImage } from "../../../Types/CatalogImage";
import type { CatalogVideo } from "../../../Types/CatalogVideo";

const PROGRAMS_PAGE_SIZE = 12;

const PROGRAM_IMAGES: CatalogImage[] = [
  { key: "digitalbankingtransformation", file: "digital-banking-transformation.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6kjCnQss90qApcuHuRkkHFseUuvyndDd-gAnVGrChJy2huiwsHontcmrXeB7CYZA_Lhx1J_vvvFZNQTM5SXzdsxGsL3M1diH1pmfgpCIlKYcpfVNa2la2Ni1KT_kDLExqF9lipxL0OMF2RU-xGf_CSg2P4hlMZAqFGDKMFLCXM1GQ6VWScxChukwBhE2Drh0pDrZO3DlGd-h1nv0UjOWsLwcJxpTPr5ZH6a1_3Q" },
  { key: "cloudfintechengineering", file: "cloud-fintech-engineering.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvhuv_BnMm_R9SWO05e2kkdwQuwbGbUsli0qWT64HfG7ikjFDbu12Mh8J9A_DV-JeJNDC_FTS_UDyWeWQ7ExBDYXGlKLrTNj2L-RdLFMBeMNmZk3Jrr-yeyHPNzuRJGzBun-3ReJceFcDobW649-KIapd_i_KL0o5VBN2lg2WFbHQU5VZebhJzPUr44ZXgad3h1jVUstzYzSjJl9GkbrabUZ820CPD5wnv57hmFQ" },
  { key: "executiveaistrategy", file: "executive-ai-strategy.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPgmbkvsBOYZDz7jDJ1DsSXD3oBl-XyHodY7ZFzFGyzw9wZZgG9TEe96yo3CTnshCsFIEoaRN0JVRhz9x4BZSrRAey0g6Mfw_J4o8EcXH0Z4uAy02xyZvQxXy94USKka9HiaCSs-v2JZEevpBUXOXdPdbPdzHV0aykdKuhkJSF_pEfgBF5VFhCbK3EjoI0FFGdscgCCYLYuFT5tyyqUR-HVkLCYT5F93M-3GaU4Q" },
  { key: "productmanagementessentials", file: "product-management-essentials.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDO6yQJv8CUxIbOa8RzugmIAFQcq1lAeaHpe4WzsI9c5oLrLkjUvJY3ObZCedZHu_FerAQPWJwTwM8AWL0Yoen3WJmO45rH75_ZXUbjLF2Wp2h_Uzbr4ZMXyUxIAFbOjgofy6jn3ovsnzwJ3sp6XyxdqxMdr3V41mdVc3zw_IV2BvXeX_2InxVTZW2nvBZoKi2Zv8bEOXkBkgZjnnOf78Tejar7QdOIzEYjnnEq8w" },
  { key: "appliedaistudio", file: "applied-ai-studio.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwODILMAmJWDl2GcY2ytKbcdsqMODusMBgrrJQCFzS3Dw4CvhGUhZFA0DP0nBRodAmjmas3fmDKRoZXu8Qaho-D3n84sIFyHLCjT37RjSKq0SU0T63zRsMtvRQH9s9zQxTVCtxgCqRyeC6H41Cwcm3Y-qIhDLT97phPUE0TOJ7RJD1jXS16c7Q0AFuF0otSaHwApU_k2mJ2_wJRqwax8Go9ogN7zXIlU3oZ5Tzcg" },
];

// One intro video per program (English voice-over, Arabic subtitles in the .vtt file).
// Files live in public/videos/programs/. Matching works like PROGRAM_IMAGES: by title / slug.
const PROGRAM_VIDEOS: CatalogVideo[] = [
  { key: "digitalbankingtransformation", file: "digital-banking-transformation" },
  { key: "cloudfintechengineering", file: "cloud-fintech-engineering" },
  { key: "executiveaistrategy", file: "executive-ai-strategy" },
  { key: "productmanagementessentials", file: "product-management-essentials" },
  { key: "appliedaistudio", file: "applied-ai-studio" },
];

export { PROGRAMS_PAGE_SIZE, PROGRAM_IMAGES, PROGRAM_VIDEOS };
