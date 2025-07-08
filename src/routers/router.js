// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import noticeRoutes from './noticeRoutes';
import freeBoardRoutes from './freeBoardRoutes';

const AppRouter = () => {
  return (
    <Routes>
      {noticeRoutes}
      {freeBoardRoutes}
    </Routes>
  );
};

export default AppRouter;
