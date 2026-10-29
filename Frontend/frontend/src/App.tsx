import RegisterContainer from "./Components/Register/RegisterContainer";
import Home from "./Components/Home/Home";
import LoginContainer from "./Components/Login/LoginContainer";
import LandingPage from "./Components/Landing/LandingPage";
import AcademyLayout from "./Components/Academy/AcademyLayout";
import CareerPathsContainer from "./Components/Academy/CareerPaths/CareerPathsContainer";
import ProgramsContainer from "./Components/Academy/Programs/ProgramsContainer";
import CoursesContainer from "./Components/Academy/Courses/CoursesContainer";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CareerPathDetailContainer from "./Components/Academy/CareerPathDetail/CareerPathDetailContainer";
import ProgramDetailContainer from "./Components/Academy/ProgramDetail/ProgramDetailContainer";
import CourseDetailContainer from "./Components/Academy/CourseDetail/CourseDetailContainer";
import PortalLayout from "./Components/Portal/PortalLayout";
import ProfileContainer from "./Components/Portal/Profile/ProfileContainer";
import PaymentsContainer from "./Components/Portal/Payments/PaymentsContainer";
import ApplicationsContainer from "./Components/Portal/Applications/ApplicationsContainer";
import ApplicationDetailContainer from "./Components/Portal/Applications/ApplicationDetailContainer";
import EnrollmentsContainer from "./Components/Portal/Enrollments/EnrollmentsContainer";
import EnrollmentDetailContainer from "./Components/Portal/Enrollments/EnrollmentDetailContainer";
import CheckoutContainer from "./Components/Portal/Checkout/CheckoutContainer";
import WorkspaceLayoutContainer from "./Components/Portal/Workspace/WorkspaceLayoutContainer";
import OverviewContainer from "./Components/Portal/Workspace/OverviewContainer";
import WorkspaceCoursesContainer from "./Components/Portal/Workspace/CoursesContainer";
import ScheduleContainer from "./Components/Portal/Workspace/ScheduleContainer";
import AssignmentsContainer from "./Components/Portal/Workspace/AssignmentsContainer";
import MaterialsContainer from "./Components/Portal/Workspace/MaterialsContainer";
import RequireRole from "./Components/Auth/RequireRole";
import StaffLayout from "./Components/Staff/StaffLayout";
import AdminHome from "./Components/Staff/Admin/AdminHome";
import UsersContainer from "./Components/Staff/Admin/UsersContainer";
import InstructorHome from "./Components/Staff/Instructor/InstructorHome";
import InstructorsContainer from "./Components/Staff/Admin/Instructors/InstructorsContainer";
import StudentsContainer from "./Components/Staff/Admin/Students/StudentsContainer";
import AdminCoursesManager from "./Components/Staff/Admin/Courses/AdminCoursesManager";
import AdminScheduleContainer from "./Components/Staff/Admin/Schedule/AdminScheduleContainer";
import CompensationContainer from "./Components/Staff/Admin/Compensation/CompensationContainer";
import ReportsContainer from "./Components/Staff/Admin/Reports/ReportsContainer";
import PermissionsContainer from "./Components/Staff/Admin/Permissions/PermissionsContainer";
import InstructorCourses from "./Components/Staff/Instructor/InstructorCourses";
import InstructorStudents from "./Components/Staff/Instructor/InstructorStudents";
import InstructorAvailability from "./Components/Staff/Instructor/InstructorAvailability";
import CoordinatorHome from "./Components/Staff/Coordinator/CoordinatorHome";
import CoordinatorCourses from "./Components/Staff/Coordinator/CoordinatorCourses";
import StaffAttendance from "./Components/Staff/Coordinator/StaffAttendance";
import InstructorSchedule from "./Components/Staff/Instructor/InstructorSchedule";
import InstructorAssignments from "./Components/Staff/Instructor/InstructorAssignments";
import InstructorMessages from "./Components/Staff/Instructor/InstructorMessages";
import InstructorEarnings from "./Components/Staff/Instructor/InstructorEarnings";
import { ROLES } from "./utils/roles";

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterContainer />} />
          <Route path="/login" element={<LoginContainer />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/starter" element={<Home />} />

          <Route element={<AcademyLayout />}>
            <Route path="/career-paths" element={<CareerPathsContainer />} />
            <Route
              path="/career-paths/:slug"
              element={<CareerPathDetailContainer />}
            />
            <Route path="/programs" element={<ProgramsContainer />} />
            <Route
              path="/programs/:slug"
              element={<ProgramDetailContainer />}
            />
            <Route path="/courses" element={<CoursesContainer />} />
            <Route path="/courses/:slug" element={<CourseDetailContainer />} />
          </Route>

          {/* Learner workspace */}
          <Route element={<RequireRole allow={[ROLES.learner]} />}>
            <Route element={<PortalLayout />}>
              <Route path="/profile" element={<ProfileContainer />} />
              <Route path="/payments" element={<PaymentsContainer />} />
              <Route path="/checkout" element={<CheckoutContainer />} />
              <Route path="/applications" element={<ApplicationsContainer />} />
              <Route path="/applications/:id" element={<ApplicationDetailContainer />} />
              <Route path="/enrollments" element={<EnrollmentsContainer />} />
              <Route path="/enrollments/:id" element={<EnrollmentDetailContainer />} />
              {/* The old demo form never saved anything; real enrolling is the coordinator flow */}
              <Route path="/enrollments/new" element={<Navigate to="/enrollments" replace />} />
              <Route path="/workspace" element={<WorkspaceLayoutContainer />}>
                <Route index element={<OverviewContainer />} />
                <Route path="courses" element={<WorkspaceCoursesContainer />} />
                <Route path="schedule" element={<ScheduleContainer />} />
                <Route path="assignments" element={<AssignmentsContainer />} />
                <Route path="materials" element={<MaterialsContainer />} />
                {/* Messages has no backend yet: old links land on the overview */}
                <Route path="messages" element={<Navigate to="/workspace" replace />} />
              </Route>
            </Route>
          </Route>

          {/* Content Manager: course content only */}
          <Route element={<RequireRole allow={[ROLES.admin, ROLES.manager, ROLES.contentManager]} />}>
            <Route element={<StaffLayout />}>
              <Route path="/admin/courses" element={<AdminCoursesManager />} />
            </Route>
          </Route>

          {/* Admin / Manager workspace */}
          <Route element={<RequireRole allow={[ROLES.admin, ROLES.manager]} />}>
            <Route element={<StaffLayout />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/instructors" element={<InstructorsContainer />} />
              <Route path="/admin/students" element={<StudentsContainer />} />
              <Route path="/admin/schedule" element={<AdminScheduleContainer />} />
              <Route path="/admin/compensation" element={<CompensationContainer />} />
              <Route path="/admin/reports" element={<ReportsContainer />} />
              <Route path="/admin/permissions" element={<PermissionsContainer />} />
            </Route>
          </Route>

          {/* Admin only: users & roles */}
          <Route element={<RequireRole allow={[ROLES.admin]} />}>
            <Route element={<StaffLayout />}>
              <Route path="/admin/users" element={<UsersContainer />} />
            </Route>
          </Route>

          {/* Coordinator workspace: people, courses, schedules, attendance, reports (no finance / security) */}
          <Route element={<RequireRole allow={[ROLES.coordinator]} />}>
            <Route element={<StaffLayout />}>
              <Route path="/coordinator" element={<CoordinatorHome />} />
              <Route path="/coordinator/instructors" element={<InstructorsContainer />} />
              <Route path="/coordinator/students" element={<StudentsContainer />} />
              <Route path="/coordinator/courses" element={<CoordinatorCourses />} />
              <Route path="/coordinator/schedule" element={<AdminScheduleContainer />} />
              <Route path="/coordinator/attendance" element={<StaffAttendance />} />
              <Route path="/coordinator/reports" element={<ReportsContainer />} />
            </Route>
          </Route>

          {/* Instructor workspace */}
          <Route element={<RequireRole allow={[ROLES.instructor]} />}>
            <Route element={<StaffLayout />}>
              <Route path="/instructor" element={<InstructorHome />} />
              <Route path="/instructor/courses" element={<InstructorCourses />} />
              <Route path="/instructor/students" element={<InstructorStudents />} />
              <Route path="/instructor/attendance" element={<StaffAttendance />} />
              <Route path="/instructor/schedule" element={<InstructorSchedule />} />
              <Route path="/instructor/assignments" element={<InstructorAssignments />} />
              <Route path="/instructor/messages" element={<InstructorMessages />} />
              <Route path="/instructor/earnings" element={<InstructorEarnings />} />
              <Route path="/instructor/availability" element={<InstructorAvailability />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
