// src/routers/userRoutes.js

import React from 'react';
import { Route } from 'react-router-dom';

import LoginPage from '../pages/user/LoginPage';
// 나중에 SignupPage, MyPage 등도 여기에 추가

const userRoutes = [
  <Route path="/login" element={<LoginPage />} key="login" />,
];

export default userRoutes;
