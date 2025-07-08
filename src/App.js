import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Menubar from './components/common/Menubar';
import Footer from './components/common/Footer';

import GreetingPage from './pages/GreetingPage'; // ✅ 수정된 경로
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <Menubar />

      <Routes>
        {/* 메인 페이지 (인사말 제외) */}
        <Route path="/" element={<HomePage />} />

        {/* 인사말 페이지 */}
        <Route path="/greeting" element={<GreetingPage />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
