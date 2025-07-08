// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import noticeRoutes from './noticeRoutes';

const AppRouter = () => {
  return <Routes>{noticeRoutes}</Routes>;
};

export default AppRouter;
