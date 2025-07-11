// src/routes/freeBoardRoutes.js
import { Route } from 'react-router-dom';

import FreeBoardList from '../pages/community/freeBoard/FreeBoardList';
import FreeBoardDetail from '../pages/community/freeBoard/FreeBoardDetail';

const freeBoardRoutes = [
  <Route path="/community/freeBoard" element={<FreeBoardList />} />,
  <Route path="/community/freeBoard/:id" element={<FreeBoardDetail />} />,
];

export default freeBoardRoutes;
