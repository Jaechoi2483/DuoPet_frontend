// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
import DuoPetGreeting from '../components/common/DuoPetGreeting';

const AppRouter = () => {
  return <Routes>
  <Route path="/greeting" element={<DuoPetGreeting />} />
  </Routes>;
=======
import noticeRoutes from './noticeRoutes';

import userRoutes from './userRoutes';
import freeBoardRoutes from './freeBoardRoutes';

import healthRoutes from './healthRoutes';
import adminRoutes from './adminRoutes';

const AppRouter = () => {
  return (
    <Routes>
      {userRoutes}
      {noticeRoutes}
      {noticeRoutes}
      {freeBoardRoutes}
      {healthRoutes}
      {adminRoutes}
    </Routes>
  );
>>>>>>> bba0ac55e35799ffcfd9a6eb684a926f518bd4c0
};

export default AppRouter;
