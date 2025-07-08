// src/App.js

import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import './App.css';

import AppRouter from './routers/router';
import Menubar from './components/common/Menubar';
import Footer from './components/common/Footer';

// 상세페이지에서만 Footer 제거용 래퍼 컴포넌트
function AppWrapper() {
  const location = useLocation();

  // 상세페이지 경로 조건 확인
  const isFreeBoardDetail = location.pathname.startsWith(
    '/community/freeBoard/'
  );

  return (
    <>
      <Menubar />
      <AppRouter />
      {!isFreeBoardDetail && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
