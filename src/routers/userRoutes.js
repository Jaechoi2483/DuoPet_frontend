// src/routers/userRoutes.js

import React from 'react';
import { Route } from 'react-router-dom';

import LoginPage from '../pages/user/LoginPage';
import SignupStep1 from '../pages/user/signup/SignupStep1';
import SignupStep2 from '../pages/user/signup/SignupStep2';
import SignupStep3 from '../pages/user/signup/SignupStep3';
import SignupStep4 from '../pages/user/signup/SignupStep4';
// 나중에 SignupPage, MyPage 등도 여기에 추가

const userRoutes = [
  <Route path="/login" element={<LoginPage />} />,
  <Route path="/signup/step1" element={<SignupStep1 />} />,
  <Route path="/signup/step2" element={<SignupStep2 />} />,
  <Route path="/signup/step3" element={<SignupStep3 />} />,
  <Route path="/signup/step4" element={<SignupStep4 />} />,
];

export default userRoutes;
