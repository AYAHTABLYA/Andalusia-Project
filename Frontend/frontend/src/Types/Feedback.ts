export type Feedback = {
  type: "error" | "success" | "info";
  text: string;
} | null;
