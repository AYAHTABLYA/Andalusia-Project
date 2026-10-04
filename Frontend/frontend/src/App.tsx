import RegisterContainer from "./Components/Register/RegisterContainer";
import Home from "./Components/Home/Home";
import LoginContainer from "./Components/Login/LoginContainer";
import LandingPage from "./Components/Landing/LandingPage";
import AcademyLayout from "./Components/Academy/AcademyLayout";
import CareerPathsContainer from "./Components/Academy/CareerPaths/CareerPathsContainer";
import ProgramsContainer from "./Components/Academy/Programs/ProgramsContainer";
import CoursesContainer from "./Components/Academy/Courses/CoursesContainer";
import CareerPathDetailComponent from "./Components/Academy/CareerPathDetail/CareerPathDetailComponent";
import ProgramDetailComponent from "./Components/Academy/ProgramDetail/ProgramDetailComponent";
import CourseDetailComponent from "./Components/Academy/CourseDetail/CourseDetailComponent";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
            <Route path="/career-paths/fintech-cloud" element={<CareerPathDetailComponent />} />
            <Route path="/programs" element={<ProgramsContainer />} />
            <Route path="/programs/digital-banking" element={<ProgramDetailComponent />} />
            <Route path="/courses" element={<CoursesContainer />} />
            <Route path="/courses/generative-ai-banking" element={<CourseDetailComponent />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
