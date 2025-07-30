// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AboutPage from '../pages/AboutPage';
import HomePage from '../pages/HomePage';
import GreetingPage from '../pages/GreetingPage';
import SessionExpired from '../pages/SessionExpired';

import noticeRoutes from './noticeRoutes';
import userRoutes from './userRoutes';
import communityRoutes from './communityRoutes';
import healthRoutes from './healthRoutes';
import adminRoutes from './adminRoutes';
import adoptionRoutes from './adoptionRoutes';

import infoRoutes from './infoRoutes';
import qnaRoutes from './qnaRoutes';

// 상담 관련 페이지 import
import ConsultationWaitingPage from '../pages/consultation/ConsultationWaitingPage';
import ConsultationChat from '../pages/consultation/ConsultationChat';

// 결제 관련 페이지 import
import PaymentSuccess from '../pages/consultation/PaymentSuccess';
import PaymentFail from '../pages/consultation/PaymentFail';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/about" element={<AboutPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/greeting" element={<GreetingPage />} />
      <Route path="/session-expired" element={<SessionExpired />} />
      {userRoutes}
      {noticeRoutes}
      {communityRoutes}
      {healthRoutes}
      {adminRoutes}
      {adoptionRoutes}
      {infoRoutes}
      {qnaRoutes}

      {/* 상담 관련 라우트 */}
      <Route path="/consultation/waiting/:roomUuid" element={<ConsultationWaitingPage />} />
      <Route path="/consultation/chat/:roomUuid" element={<ConsultationChat />} />
      
      {/* 결제 관련 라우트 */}
      <Route path="/consultation/payment/success" element={<PaymentSuccess />} />
      <Route path="/consultation/payment/fail" element={<PaymentFail />} />
    </Routes>
  );
};

export default AppRouter;
