import { getStaffSchedule, getStaffStudents } from "../../apis/staffApi";
import type { StaffSessionDto, StaffStudentDto } from "../../apis/staffApi";
import useStaffData from "./useStaffData";

type TeachingRecords = { students: StaffStudentDto[]; sessions: StaffSessionDto[] };
const EMPTY: TeachingRecords = { students: [], sessions: [] };

// The instructor's own learners + sessions (the API limits both to the instructor's batches).
// Used by "My courses" and "My students".
function useTeachingRecords() {
  return useStaffData<TeachingRecords>(
    async (signal) => {
      const [students, sessions] = await Promise.all([
        getStaffStudents(undefined, signal),
        getStaffSchedule(undefined, signal).catch(() => [] as StaffSessionDto[]),
      ]);
      return { students, sessions };
    },
    EMPTY,
    "Could not load your records.",
  );
}

export default useTeachingRecords;
