type ProfileData = {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  campus: string;
  studentId: string;
  memberSince: string;
};

// The fields the learner is allowed to edit.
type EditableProfile = Pick<
  ProfileData,
  "firstName" | "lastName" | "title" | "phone" | "campus"
>;

type ProfileMetric = {
  id: string;
  label: string;
  icon: string;
  value: string;
  valueNote?: string;
  caption: string;
  progress?: number; // 0-100, renders a progress bar
  footerLeft: string;
  footerRight?: string;
};

type EnrollmentSummary = {
  status: string;
  degree: string;
  accreditation: string;
  module: string;
  progress: number;
  mentor: string;
  nextSession: string;
  deliverable: string;
  deliverableDue: string;
};

export type { ProfileData, EditableProfile, ProfileMetric, EnrollmentSummary };
