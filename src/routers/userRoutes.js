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
import MypagePage from '../pages/mypage/MypagePage';
import EditProfilePage from '../pages/mypage/components/profile/EditProfilePage';
import PetRegisterPage from '../pages/mypage/components/pets/PetRegisterPage';
import PetDetail from '../pages/mypage/components/pets/PetDetail';
import PetEditPage from '../pages/mypage/components/pets/PetEditPage';
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
  <Route path="/mypage" element={<MypagePage />} />,
  <Route path="/mypage/profile/edit" element={<EditProfilePage />} />,
  <Route path="/mypage/pet/register" element={<PetRegisterPage />} />,
  <Route path="/mypage/pet/:petId" element={<PetDetail />} />,
  <Route path="/mypage/pet/:petId/edit" element={<PetEditPage />} />,
];

export default userRoutes;
