// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DuoPetGreeting from '../components/common/DuoPetGreeting';
import AboutPage from '../pages/AboutPage';
import noticeRoutes from './noticeRoutes';
import userRoutes from './userRoutes';
import freeBoardRoutes from './freeBoardRoutes';
import healthRoutes from './healthRoutes';
import adminRoutes from './adminRoutes';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/greeting" element={<DuoPetGreeting />} />
      <Route path="/about" element={<AboutPage />} />
      {userRoutes}
      {noticeRoutes}
      {freeBoardRoutes}
      {healthRoutes}
      {adminRoutes}
    </Routes>
  );
};

export default AppRouter;
