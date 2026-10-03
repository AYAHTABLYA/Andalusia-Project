import RegisterContainer from "./Components/Register/RegisterContainer";
import Home from "./Components/Home/Home";
import LoginContainer from "./Components/Login/LoginContainer";
import LandingPage from "./Components/Landing/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="container">
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterContainer />} />
          <Route path="/login" element={<LoginContainer />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/starter" element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
