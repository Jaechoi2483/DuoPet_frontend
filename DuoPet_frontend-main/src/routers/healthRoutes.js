// src/routers/healthRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

// Health 관련 컴포넌트 import
import HealthMain from '../pages/health/HealthMain';
import AiDiagnosis from '../pages/health/AiDiagnosis';
import AiBehavior from '../pages/health/AiBehavior';
import ExpertConsult from '../pages/health/ExpertConsult';

const healthRoutes = [
  <Route key="health-main" path="/health" element={<HealthMain />} />,
  <Route key="ai-diagnosis" path="/health/ai-diagnosis" element={<AiDiagnosis />} />,
  <Route key="ai-behavior" path="/health/ai-behavior" element={<AiBehavior />} />,
  <Route key="expert-consult" path="/health/expert-consult" element={<ExpertConsult />} />,
];

export default healthRoutes;