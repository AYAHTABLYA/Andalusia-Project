type ProfileData = {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  campus: string;
  campusId: number | null;
  studentId: string;
  memberSince: string;
  photoUrl: string | null;
};

// The fields the learner is allowed to edit.
type EditableProfile = Pick<
  ProfileData,
  "firstName" | "lastName" | "title" | "phone" | "campusId"
>;

type CampusOption = { id: number; name: string };

type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
};

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

export type {
  ProfileData,
  EditableProfile,
  CampusOption,
  ChangePasswordValues,
  ProfileMetric,
  EnrollmentSummary,
};
