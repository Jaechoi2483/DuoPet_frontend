// src/App.js

import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import './App.css';
import AppRouter from './routers/router';
import Menubar from './components/common/Menubar';
import Footer from './components/common/Footer';
import { SignupProvider } from './components/context/SignupContext';
import ChatBot from './components/common/ChatBot';
import ChatbotModal from './components/common/ChatbotModal';
import chatbotStyles from './components/common/Chatbot.module.css';

// 상세페이지에서만 Footer 제거용 래퍼 컴포넌트
function AppWrapper() {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const footerRef = useRef(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    if (!footerRef.current) return;
    const handleResize = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.getBoundingClientRect().height);
      }
    };
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
        if (entry.isIntersecting && footerRef.current) {
          setFooterHeight(footerRef.current.getBoundingClientRect().height);
        }
      },
      {
        root: null,
        threshold: 0.1,
      }
    );
    observer.observe(footerRef.current);
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 상세페이지 경로 조건 확인
  const isFreeBoardDetail = location.pathname.startsWith(
    '/community/freeBoard/'
  );

  return (
    <>
      <Menubar />
      <AppRouter />
      {!isFreeBoardDetail && <Footer ref={footerRef} />}

      {/* 챗봇 플로팅 버튼 */}
      <button
        className={
          chatbotStyles.chatbotFloatingBtn +
          ' ' +
          chatbotStyles.noBgBtn
        }
        style={footerVisible ? { bottom: `${footerHeight + 16}px` } : {}}
        onClick={() => setIsChatOpen(true)}
        aria-label="챗봇 열기"
      >
        <span className={chatbotStyles.chatbotIcon}>
          {/* 미니멀 말풍선 SVG 아이콘 */}
          <svg width="60" height="60" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g transform="translate(0,-2)">
              <path d="M6 18C4.89543 18 4 17.1046 4 16V8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8V16C28 17.1046 27.1046 18 26 18H16.83C16.4172 18 16.0292 18.1679 15.76 18.46L12.53 21.95C12.24 22.26 11.76 22.26 11.47 21.95L8.24 18.46C7.9708 18.1679 7.58277 18 7.17 18H6Z" stroke="white" strokeWidth="2" fill="#3b82f6"/>
              <circle cx="12" cy="12" r="1.2" fill="white"/>
              <circle cx="16" cy="12" r="1.2" fill="white"/>
              <circle cx="20" cy="12" r="1.2" fill="white"/>
            </g>
          </svg>
        </span>
      </button>
      {/* 챗봇 모달 */}
      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}>
        <ChatBot isOpen={true} onClose={() => setIsChatOpen(false)} hideClose={true} />
      </ChatbotModal>
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
