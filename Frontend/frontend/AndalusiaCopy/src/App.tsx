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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
