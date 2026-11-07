import { useLocation } from "react-router-dom";

// Admin and Coordinator share some pages (Instructors, Students, Schedule, Reports); the URL prefix tells them apart.
// A Coordinator never creates accounts and never sees revenue (the API enforces the same limits).
function useIsCoordinator(): boolean {
  return useLocation().pathname.startsWith("/coordinator");
}

export default useIsCoordinator;
