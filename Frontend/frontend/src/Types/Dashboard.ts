import type { EnrollmentSummary, ProfileMetric } from "./Profile";

// UI model built from GET /api/learner/dashboard (see apis/portalMappers.ts).
type LearnerDashboard = {
  metrics: ProfileMetric[];
  enrollment: EnrollmentSummary | null;
};

export type { LearnerDashboard };
