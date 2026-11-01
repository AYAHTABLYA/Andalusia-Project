type ApplicationFormType = {
  fullName: string;
  email: string;
  phone: string;
  track: string;
  experience: string;
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export type { ApplicationFormType, SubmitStatus };
