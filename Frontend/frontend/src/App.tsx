import RegisterContainer from "./Components/Register/RegisterContainer";
import Home from "./Components/Home/Home";
import LoginContainer from "./Components/Login/LoginContainer";
import LandingPage from "./Components/Landing/LandingPage";
import AcademyLayout from "./Components/Academy/AcademyLayout";
import CareerPathsContainer from "./Components/Academy/CareerPaths/CareerPathsContainer";
import ProgramsContainer from "./Components/Academy/Programs/ProgramsContainer";
import CoursesContainer from "./Components/Academy/Courses/CoursesContainer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CareerPathDetailContainer from "./Components/Academy/CareerPathDetail/CareerPathDetailContainer";
import ProgramDetailContainer from "./Components/Academy/ProgramDetail/ProgramDetailContainer";
import CourseDetailContainer from "./Components/Academy/CourseDetail/CourseDetailContainer";
import PortalLayout from "./Components/Portal/PortalLayout";
import ProfileContainer from "./Components/Portal/Profile/ProfileContainer";
import PaymentsContainer from "./Components/Portal/Payments/PaymentsContainer";
import ApplicationsContainer from "./Components/Portal/Applications/ApplicationsContainer";
import ApplicationDetailContainer from "./Components/Portal/Applications/ApplicationDetailContainer";
import EnrollmentContainer from "./Components/Portal/Enrollment/EnrollmentContainer";
import EnrollmentsContainer from "./Components/Portal/Enrollments/EnrollmentsContainer";
import EnrollmentDetailContainer from "./Components/Portal/Enrollments/EnrollmentDetailContainer";
import CheckoutContainer from "./Components/Portal/Checkout/CheckoutContainer";
import RequireRole from "./Components/Auth/RequireRole";
import StaffLayout from "./Components/Staff/StaffLayout";
import AdminHome from "./Components/Staff/Admin/AdminHome";
import UsersContainer from "./Components/Staff/Admin/UsersContainer";
import InstructorHome from "./Components/Staff/Instructor/InstructorHome";
import StaffWorkspacePage from "./Components/Staff/Shared/StaffWorkspacePage";
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
              <Route path="/enrollments/new" element={<EnrollmentContainer />} />
            </Route>
          </Route>

          {/* Admin / Manager / Content Manager workspace */}
          <Route element={<RequireRole allow={[ROLES.admin, ROLES.manager, ROLES.contentManager]} />}>
            <Route element={<StaffLayout />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/instructors" element={<StaffWorkspacePage />} />
              <Route path="/admin/students" element={<StaffWorkspacePage />} />
              <Route path="/admin/courses" element={<StaffWorkspacePage />} />
              <Route path="/admin/schedule" element={<StaffWorkspacePage />} />
              <Route path="/admin/compensation" element={<StaffWorkspacePage />} />
              <Route path="/admin/reports" element={<StaffWorkspacePage />} />
              <Route path="/admin/permissions" element={<StaffWorkspacePage />} />
            </Route>
          </Route>

          {/* Admin only: users & roles */}
          <Route element={<RequireRole allow={[ROLES.admin]} />}>
            <Route element={<StaffLayout />}>
              <Route path="/admin/users" element={<UsersContainer />} />
            </Route>
          </Route>

          {/* Instructor workspace */}
          <Route element={<RequireRole allow={[ROLES.instructor]} />}>
            <Route element={<StaffLayout />}>
              <Route path="/instructor" element={<InstructorHome />} />
              <Route path="/instructor/schedule" element={<StaffWorkspacePage />} />
              <Route path="/instructor/assignments" element={<StaffWorkspacePage />} />
              <Route path="/instructor/messages" element={<StaffWorkspacePage />} />
              <Route path="/instructor/earnings" element={<StaffWorkspacePage />} />
              <Route path="/instructor/availability" element={<StaffWorkspacePage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
