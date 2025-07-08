// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import noticeRoutes from './noticeRoutes';
import userRoutes from './userRoutes';

const AppRouter = () => {
  return (
    <Routes>
      {userRoutes}
      {noticeRoutes}
    </Routes>
  );
};

export default AppRouter;
