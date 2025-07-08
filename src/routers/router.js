// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import DuoPetGreeting from '../components/common/DuoPetGreeting';
import noticeRoutes from './noticeRoutes';
import userRoutes from './userRoutes';
import freeBoardRoutes from './freeBoardRoutes';
import healthRoutes from './healthRoutes';
import adminRoutes from './adminRoutes';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/greeting" element={<DuoPetGreeting />} />
      {userRoutes}
      {noticeRoutes}
      {freeBoardRoutes}
      {healthRoutes}
      {adminRoutes}
    </Routes>
  );
};

export default AppRouter;
