import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Menubar from './components/common/Menubar';
import Footer from './components/common/Footer';

function App() {
  return (
    <Router>
      {/* 라우터 등록은 App.js 에서 설정함 */}
      <Menubar />
      메인페이지
      <Footer />
    </Router>
  );
}

export default App;
