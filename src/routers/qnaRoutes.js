// src/routers/qnaRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

import Qna from '../pages/admin/Qna';
import QnaDetail from '../pages/admin/QnaDetail';
import QnaWrite from '../pages/admin/QnaWrite';

const qnaRoutes = [
  <Route path="/admin/qna" element={<Qna />} />,
  <Route path="/admin/qna/:contentId" element={<QnaDetail />} />,
  <Route path="/admin/qna/write" element={<QnaWrite />} />,
];

export default qnaRoutes;
