// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import noticeRoutes from './noticeRoutes';
import adminRoutes from './adminRoutes';

const AppRouter = () => {
  return (
    <Routes>
      {noticeRoutes}
      {adminRoutes}
    </Routes>
  );
};

export default AppRouter;
