// src/App.js

import React, { useRef, useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import './App.css';
import AppRouter from './routers/router';
import Menubar from './components/common/Menubar';
import Footer from './components/common/Footer';
import { SignupProvider } from './components/context/SignupContext';
import ChatBot from './components/common/ChatBot';
import ChatbotModal from './components/common/ChatbotModal';
import chatbotStyles from './components/common/Chatbot.module.css';
import NotificationToast from './components/consultation/NotificationToast';
import websocketService from './services/websocketService';
import { AuthContext } from './AuthProvider';
import apiClient from './utils/axios';

// 상세페이지에서만 Footer 제거용 래퍼 컴포넌트
function AppWrapper() {
  const location = useLocation();
  const { isLoggedIn, role, userNo, isAuthLoading } = useContext(AuthContext);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const footerRef = useRef(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  
  // WebSocket 연결 관리
  useEffect(() => {
    // 인증 로딩이 완료되지 않았으면 대기
    if (isAuthLoading) {
      console.log('인증 상태 확인 중... WebSocket 연결 대기');
      return;
    }
    
    console.log('WebSocket 연결 조건 확인:', {
      isLoggedIn,
      role,
      isVet: role === 'VET' || role === 'vet',
      userNo
    });
    
    if (isLoggedIn) {
      // 로그인한 모든 사용자는 WebSocket 연결
      console.log(`${role} 사용자로 로그인됨, WebSocket 연결 중...`);
      
      // loginId를 사용 (백엔드가 loginId로 메시지를 보냄)
      let userIdentifier = localStorage.getItem('loginId');
      
      if (!userIdentifier) {
        // OAuth 로그인의 경우 loginId가 없으므로 JWT의 sub 필드 사용
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          try {
            // JWT 토큰 디코딩 (간단한 방법)
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            userIdentifier = payload.sub; // JWT의 subject 필드
            console.log('JWT subject 사용:', userIdentifier);
          } catch (e) {
            console.error('JWT 파싱 실패:', e);
          }
        }
      }
      
      console.log('사용할 식별자:', userIdentifier);
      console.log('사용자 역할:', role);
      
      if (userIdentifier) {
        // WebSocket 연결 - 토큰으로 연결
        const accessToken = localStorage.getItem('accessToken');
        
        websocketService.connect(accessToken)
          .then(() => {
            console.log(`WebSocket 연결 성공 (role: ${role}, identifier: ${userIdentifier})`);
            
            // 전문가인 경우에만 상담 알림 구독
            if (role === 'VET' || role === 'vet') {
              // 알림 표시 함수 정의
              const showNotification = (notification) => {
                console.log('🔔 상담 요청 알림:', notification);
                setNotificationData(notification);
                setShowNotification(true);
                
                // 알림음 재생 (옵션)
                // const audio = new Audio('/notification-sound.mp3');
                // audio.play().catch(e => console.log('알림음 재생 실패:', e));
              };
              
              // 전역 함수로도 등록 (디버깅용)
              window.showConsultationRequestNotification = showNotification;
              
              // WebSocket 구독 설정 - subscribeToNotifications 메서드 사용
              websocketService.subscribeToNotifications((notification) => {
                console.log('🔔 상담 요청 알림:', notification);
                setNotificationData(notification);
                setShowNotification(true);
              });
              
              console.log('전문가 알림 구독 설정 완료');
            } else {
              console.log('일반 사용자 WebSocket 연결 완료');
            }
          })
          .catch(err => {
            console.error('WebSocket 연결 실패:', err);
          });
      } else {
        console.error('사용자 식별자를 찾을 수 없습니다.');
      }
    }
    
    return () => {
      // 컴포넌트 언마운트 시 WebSocket 연결 해제
      if (websocketService.isConnected()) {
        websocketService.disconnect();
      }
    };
  }, [isLoggedIn, role, isAuthLoading]);

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
      
      {/* 전문가 알림 시스템 */}
      {showNotification && notificationData && (
        <NotificationToast 
          notification={notificationData}
          onClose={() => setShowNotification(false)}
        />
      )}

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
