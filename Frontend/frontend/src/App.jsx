import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react me-router-dom"; // إذا كنتِ تستخدمين React Router

// استدعاء مكون الشات بوت
import CustomerServiceBot from "./components/CustomerServiceBot/CustomerServiceBot";

// استدعاء مكونات صفحاتك
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <div className="app-main-layout">
        {/* الهيدر الخاص بموقعك */}
        {/* <Navbar /> */}

        {/* محتوى الصفحات المتغيرة */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/about" element={<About />} />
        </Routes>

        {/* الفوتر الخاص بموقعك */}
        {/* <Footer /> */}

        {/* ---------------------------------------------------- */}
        {/* الشات بوت يتم وضعه هنا ليكون ثابتاً في كل الصفحات */}
        {/* ---------------------------------------------------- */}
        <CustomerServiceBot />
      </div>
    </Router>
  );
}

export default App;
