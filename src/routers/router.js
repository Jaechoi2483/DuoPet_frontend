// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import noticeRoutes from './noticeRoutes';
import healthRoutes from './healthRoutes';

const AppRouter = () => {
  return (
    <Routes>
      {noticeRoutes}
      {healthRoutes}
    </Routes>
  );
};

export default AppRouter;
