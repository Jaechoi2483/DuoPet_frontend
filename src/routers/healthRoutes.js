// src/routers/healthRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

// Health 관련 컴포넌트 import - HealthMain으로 통합
import HealthMain from '../pages/health/HealthMain';

const healthRoutes = [
  <Route key="health-main" path="/health" element={<HealthMain />} />,
  <Route key="ai-diagnosis" path="/health/ai-diagnosis" element={<HealthMain />} />,
  <Route key="ai-behavior" path="/health/ai-behavior" element={<HealthMain />} />,
  <Route key="expert-consult" path="/health/expert-consult" element={<HealthMain />} />,
];

export default healthRoutes;