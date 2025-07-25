// src/routes/freeBoardRoutes.js
import { Route } from 'react-router-dom';

import FreeBoardList from '../pages/community/freeBoard/FreeBoardList';
import FreeBoardDetail from '../pages/community/freeBoard/FreeBoardDetail';
import FreeBoardWrite from '../pages/community/freeBoard/FreeBoardWrite';
import FreeBoardEdit from '../pages/community/freeBoard/FreeBoardEdit';
import RecommendVideoPage from '../pages/community/video/RecommendVideoPage';

const freeBoardRoutes = [
  <Route path="/community/freeBoard" element={<FreeBoardList />} />,
  <Route path="/community/freeBoard/:id" element={<FreeBoardDetail />} />,
  <Route path="/community/freeBoard/write" element={<FreeBoardWrite />} />,
  <Route path="/community/freeBoard/Edit/:id" element={<FreeBoardEdit />} />,
  <Route path="/community/video/video-test" element={<RecommendVideoPage />} />,
];

export default freeBoardRoutes;
