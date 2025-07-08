// src/routes/noticeRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

import NoticeList from '../pages/notice/NoticeList';
// import NoticeDetail from '../pages/notice/NoticeDetail';
// import NoticeUpdate from '../pages/notice/NoticeUpdate';
// import NoticeWrite from '../pages/notice/NoticeWrite';

const noticeRoutes = [
  <Route path="/notice" element={<NoticeList />} />,
  //   <Route path="/noticed/:no" element={<NoticeDetail />} />,
  //   <Route path="/noticeu/:no" element={<NoticeUpdate />} />,
  //   <Route path="/noticew" element={<NoticeWrite />} />,
];

export default noticeRoutes;
