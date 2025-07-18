// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AboutPage from '../pages/AboutPage';
import HomePage from '../pages/HomePage';
import GreetingPage from '../pages/GreetingPage';

import noticeRoutes from './noticeRoutes';
import userRoutes from './userRoutes';
import freeBoardRoutes from './freeBoardRoutes';
import healthRoutes from './healthRoutes';
import adminRoutes from './adminRoutes';
import adoptionRoutes from './adoptionRoutes';

import infoRoutes from './infoRoutes';
import qnaRoutes from './qnaRoutes';


const AppRouter = () => {
  return (
    <Routes>
      <Route path="/about" element={<AboutPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/greeting" element={<GreetingPage />} />
      {userRoutes}
      {noticeRoutes}
      {freeBoardRoutes}
      {healthRoutes}
      {adminRoutes}
      {adoptionRoutes}
      {infoRoutes}
      {qnaRoutes}
    </Routes>
  );
};

export default AppRouter;
