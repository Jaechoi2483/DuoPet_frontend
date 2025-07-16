// src/App.js

import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import AppRouter from './routers/router';
import Menubar from './components/common/Menubar';
import Footer from './components/common/Footer';

import DuoPetGreeting from './components/common/DuoPetGreeting';
import { SignupProvider } from './components/context/SignupContext';
import ChatBot from './components/common/ChatBot';
import Modal from './components/common/Modal';
import chatbotStyles from './components/common/Chatbot.module.css';

// 상세페이지에서만 Footer 제거용 래퍼 컴포넌트
function AppWrapper() {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  // 상세페이지 경로 조건 확인
  const isFreeBoardDetail = location.pathname.startsWith(
    '/community/freeBoard/'
  );

  return (
    <>
      <Menubar />
      <AppRouter />
      {!isFreeBoardDetail && <Footer />}

      {/* 챗봇 플로팅 버튼 */}
      <button
        className={chatbotStyles.chatbotFloatingBtn}
        onClick={() => setIsChatOpen(true)}
        aria-label="챗봇 열기"
      >
        <span className={chatbotStyles.chatbotIcon}>💬</span>
      </button>
      {/* 챗봇 모달 */}
      <Modal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}>
        <ChatBot isOpen={true} onClose={() => setIsChatOpen(false)} />
      </Modal>
    </>
  );
}

function App() {
  return (
    <Router>
      <SignupProvider>
        <AppWrapper />
      </SignupProvider>
    </Router>
  );
}

export default App;
