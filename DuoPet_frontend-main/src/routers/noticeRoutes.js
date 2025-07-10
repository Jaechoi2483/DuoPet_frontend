// src/routes/noticeRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

import NoticeList from '../pages/notice/NoticeList';
import NoticeDetail from '../pages/notice/NoticeDetail';
import NoticeUpdate from '../pages/notice/NoticeUpdate';
import NoticeWrite from '../pages/notice/NoticeWrite';
// import QnaDetail from '../pages/admin/QnaDetail';

const noticeRoutes = [
  <Route path="/notice" element={<NoticeList />} />,
  <Route path="/notice/:contentId" element={<NoticeDetail />} />,
  <Route path="/notice/write" element={<NoticeWrite />} />,
  <Route path="/notice/update/:contentId" element={<NoticeUpdate />} />,
  // <Route path="/admin/qna/:qnaId" element={<QnaDetail />} />, // QnA 라우터는 qnaRoutes.js로 이동
  //   <Route path="/noticeu/:no" element={<NoticeUpdate />} />,
  //   <Route path="/noticew" element={<NoticeWrite />} />,
];

export default noticeRoutes;
