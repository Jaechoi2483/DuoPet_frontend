// src/routes/freeBoardRoutes.js
import { Route } from 'react-router-dom';
import RecommendVideoPage from '../pages/community/video/RecommendVideoPage';
import BoardWrite from '../pages/community/write/BoardWrite';
import BoardEdit from '../pages/community/edit/BoardEdit';

// 자유게시판
import FreeBoardList from '../pages/community/freeBoard/FreeBoardList';
import FreeBoardDetail from '../pages/community/freeBoard/FreeBoardDetail';

// 후기게시판
import ReviewBoardList from '../pages/community/reviewBoard/ReviewBoardList';
import ReviewBoardDetail from '../pages/community/reviewBoard/ReviewBoardDetail';

// 팁게시판
import TipBoardList from '../pages/community/tipBoard/TipBoardList';
import TipBoardDetail from '../pages/community/tipBoard/TipBoardDetail';

// 질문게시판
import QuestionBoardList from '../pages/community/questionBoard/QuestionBoardList';
import QuestionBoardDetail from '../pages/community/questionBoard/QuestionBoardDetail';

const freeBoardRoutes = [
  <Route path="/community/freeBoard" element={<FreeBoardList />} />,
  <Route path="/community/freeBoard/:id" element={<FreeBoardDetail />} />,
  <Route path="/community/freeBoard/write" element={<BoardWrite category="free" route="freeBoard" />} />,
  <Route path="/community/freeBoard/edit/:id" element={<BoardEdit category="free" route="freeBoard" />} />,
  <Route path="/community/video/video-test" element={<RecommendVideoPage />} />,
];

const reviewBoardRoutes = [
  <Route path="/community/reviewBoard" element={<ReviewBoardList />} />,
  <Route path="/community/reviewBoard/:id" element={<ReviewBoardDetail />} />,
  <Route path="/community/reviewBoard/write" element={<BoardWrite category="review" route="reviewBoard" />} />,
  <Route path="/community/reviewBoard/edit/:id" element={<BoardEdit category="review" route="reviewBoard" />} />,
  <Route path="/community/video/video-test" element={<RecommendVideoPage />} />,
];

const tipBoardRoutes = [
  <Route path="/community/tipBoard" element={<TipBoardList />} />,
  <Route path="/community/tipBoard/:id" element={<TipBoardDetail />} />,
  <Route path="/community/tipBoard/write" element={<BoardWrite category="tip" route="tipBoard" />} />,
  <Route path="/community/tipBoard/edit/:id" element={<BoardEdit category="tip" route="tipBoard" />} />,
  <Route path="/community/video/video-test" element={<RecommendVideoPage />} />,
];

const questionBoardRoutes = [
  <Route path="/community/questionBoard" element={<QuestionBoardList />} />,
  <Route path="/community/questionBoard/:id" element={<QuestionBoardDetail />} />,
  <Route path="/community/questionBoard/write" element={<BoardWrite category="question" route="questionBoard" />} />,
  <Route path="/community/questionBoard/edit/:id" element={<BoardEdit category="question" route="questionBoard" />} />,
  <Route path="/community/video/video-test" element={<RecommendVideoPage />} />,
];

const communityRoutes = [...freeBoardRoutes, ...reviewBoardRoutes, ...tipBoardRoutes, ...questionBoardRoutes];
export default communityRoutes;
