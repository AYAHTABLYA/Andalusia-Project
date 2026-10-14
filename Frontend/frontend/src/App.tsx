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

          <Route element={<PortalLayout />}>
            <Route path="/profile" element={<ProfileContainer />} />
            <Route path="/payments" element={<PaymentsContainer />} />
            <Route path="/applications" element={<ApplicationsContainer />} />
            <Route path="/applications/:id" element={<ApplicationDetailContainer />} />
            <Route path="/enrollments" element={<EnrollmentsContainer />} />
            <Route path="/enrollments/:id" element={<EnrollmentDetailContainer />} />
            <Route path="/enrollments/new" element={<EnrollmentContainer />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
