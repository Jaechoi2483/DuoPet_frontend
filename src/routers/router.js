// src/routers/router.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DuoPetGreeting from '../components/common/DuoPetGreeting';

const AppRouter = () => {
  return <Routes>
  <Route path="/greeting" element={<DuoPetGreeting />} />
  </Routes>;
};

export default AppRouter;
