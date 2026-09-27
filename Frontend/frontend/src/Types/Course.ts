type Course = {
  id: number;
  category: string;
  modeLabel: string;
  modeVariant: "offline" | "blended";
  title: string;
  description: string;
  nextBatch: string;
  duration: string;
  hall: string;
  instructorInitials: string;
  instructorName: string;
  instructorTitle: string;
  price: string;
};

export type { Course };
