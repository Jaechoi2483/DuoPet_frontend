// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
};

export default AppRouter;
