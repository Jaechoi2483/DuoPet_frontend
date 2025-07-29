// src/routers/healthRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

// Health 관련 컴포넌트 import - HealthMain으로 통합
import HealthMain from '../pages/health/HealthMain';
import QnaConsultation from '../pages/health/QnaConsultation';
import QnaConsultationDetail from '../pages/health/QnaConsultationDetail';

const healthRoutes = [
  <Route key="health-main" path="/health" element={<HealthMain />} />,
  <Route key="ai-diagnosis" path="/health/ai-diagnosis" element={<HealthMain />} />,
  <Route key="ai-behavior" path="/health/ai-behavior" element={<HealthMain />} />,
  <Route key="expert-consult" path="/health/expert-consult" element={<HealthMain />} />,
  <Route key="qna-consultation" path="/health/qna-consultation" element={<QnaConsultation />} />,
  <Route key="qna-consultation-detail" path="/health/qna-consultation/:roomId" element={<QnaConsultationDetail />} />,
];

export default healthRoutes;