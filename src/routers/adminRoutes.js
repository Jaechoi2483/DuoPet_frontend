import React from 'react';
import { Route } from 'react-router-dom';
import Faq from '../pages/admin/Faq';
import Qna from '../pages/admin/Qna';
import AdminView from '../pages/admin/AdminView';

const adminRoutes = [
  <Route path="/faq" element={<Faq />} />,
  <Route path="/qna" element={<Qna />} />,
  <Route path="/admin" element={<AdminView />} />,
];

export default adminRoutes;
