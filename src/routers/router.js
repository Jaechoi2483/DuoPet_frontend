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

// 상담 관련 페이지 import
import ConsultationWaitingPage from '../pages/consultation/ConsultationWaitingPage';
import ConsultationChat from '../pages/consultation/ConsultationChat';

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
      
      {/* 상담 관련 라우트 */}
      <Route path="/consultation/waiting/:roomId" element={<ConsultationWaitingPage />} />
      <Route path="/consultation/chat/:roomId" element={<ConsultationChat />} />
    </Routes>
  );
};

export default AppRouter;
