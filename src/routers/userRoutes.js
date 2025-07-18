// src/routers/userRoutes.js

import React from 'react';
import { Route } from 'react-router-dom';

import LoginPage from '../pages/user/LoginPage';
import SignupStep1 from '../pages/user/signup/SignupStep1';
import SignupStep2 from '../pages/user/signup/SignupStep2';
import SignupStep3 from '../pages/user/signup/SignupStep3';
import SignupStep4 from '../pages/user/signup/SignupStep4';
import SignupStep5 from '../pages/user/signup/SignupStep5';
import PetRegister from '../pages/user/pet/PetRegister';
import SocialSignupPage from '../pages/social/SocialSignupPage';
import SocialRedirect from '../pages/social/SocialRedirect';
import FindIdPage from '../pages/user/FindIdPage';
import FindPasswordPage from '../pages/user/FindPasswordPage';
import ResetPasswordPage from '../pages/user/ResetPasswordPage';
// 나중에 SignupPage, MyPage 등도 여기에 추가

const userRoutes = [
  <Route path="/login" element={<LoginPage />} />,
  <Route path="/signup/step1" element={<SignupStep1 />} />,
  <Route path="/signup/step2" element={<SignupStep2 />} />,
  <Route path="/signup/step3" element={<SignupStep3 />} />,
  <Route path="/signup/step4" element={<SignupStep4 />} />,
  <Route path="/signup/step5" element={<SignupStep5 />} />,
  <Route path="/user/pet/register" element={<PetRegister />} />,
  <Route path="/social-signup" element={<SocialSignupPage />} />,
  <Route path="/social-redirect" element={<SocialRedirect />} />,
  <Route path="/find-id" element={<FindIdPage />} />,
  <Route path="/find-password" element={<FindPasswordPage />} />,
  <Route path="/reset-password" element={<ResetPasswordPage />} />,
];

export default userRoutes;
