import React, { useState, useEffect, useRef, useContext } from 'react';
import apiClient from '../../utils/axios';
import styles from './Chatbot.module.css';
import { AuthContext } from '../../AuthProvider';
import { useNavigate } from 'react-router-dom';

function ChatBot({ isOpen, onClose, hideClose }) {
  const navigate = useNavigate();
  const { userNo, isLoggedIn, isAuthLoading } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // 챗봇 초기 메시지 설정
    if (!isAuthLoading) {
      if (!isLoggedIn) {
        // 비로그인 사용자
        setChatHistory([
          {
            role: 'assistant',
            content: '안녕하세요! DuoPet에 오신 것을 환영합니다. 로그인하시면 더 많은 기능을 이용하실 수 있어요.',
            actions: [{ name: 'login', description: '로그인하기', url: '/login' }],
            predicted_questions: [
              '회원가입은 어떻게 하나요?',
              '비밀번호를 잊어버렸어요.',
              'DuoPet 서비스는 무엇인가요?',
            ],
          },
        ]);
      } else {
        // 로그인한 사용자
        setChatHistory([
          {
            role: 'assistant',
            content: '안녕하세요! DuoPet에 대해 무엇이든 물어보세요.',
            predicted_questions: ['우리 아이 건강 상태는 어때?', '내 정보 확인', '재미있는 영상 추천해줘'],
          },
        ]);
      }
    }
  }, [isLoggedIn, isAuthLoading]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  if (!isOpen) return null;

  if (isAuthLoading) {
    return (
      <div className={styles.chatbotContainer}>
        <div className={styles.chatWindow}>
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.bubble}>사용자 정보를 확인 중입니다...</div>
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (msg) => {
    const sendMsg = msg !== undefined ? msg : message;
    if (!sendMsg.trim() || isLoading) return;
    const userMessage = { role: 'user', content: sendMsg };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setMessage('');
    if (inputRef.current) inputRef.current.focus();

    try {
      const aiServerBaseUrl = 'http://localhost:8000/api/v1/chatbot/chat';
      const apiKey = 'DUOPET_DEV_MASTER_KEY';

      const currentUserId = isLoggedIn ? String(userNo) : '0';
      const aiServerUrlWithQuery = `${aiServerBaseUrl}?user_id=${currentUserId}`;

      const response = await apiClient.post(
        aiServerUrlWithQuery,
        {
          message: sendMsg,
          user_id: currentUserId, // user_id를 로그인 여부에 따라 동적으로 전송
        },
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      );

      if (response.data.success) {
        const aiResponseData = response.data.data;

        const aiMessage = {
          role: 'assistant',
          content: aiResponseData.answer,
          actions: aiResponseData.suggested_actions, // 처리된 actions 사용
          predicted_questions: aiResponseData.predicted_questions,
        };
        setChatHistory((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: `오류가 발생했습니다: ${response.data.error.message}`,
        };
        setChatHistory((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Axios 응답 에러 : ', error);
      const networkError = {
        role: 'assistant',
        content: '챗봇 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
      };
      setChatHistory((prev) => [...prev, networkError]);
    } finally {
      setIsLoading(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handlePredictedQuestionClick = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatbotHeader}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      </div>
      <div className={styles.chatWindow}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
            <div className={styles.bubble}>
              {msg.content}
              {msg.actions && msg.actions.length > 0 && (
                <div className={styles.actionsContainer}>
                  {msg.actions.map((action) => (
                    <button
                      key={action.name}
                      className={styles.actionButton}
                      onClick={() => navigate(action.url)} // 클릭 시 navigate 함수 호출
                    >
                      {action.description}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.bubble}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 👇 [추가된 부분] 예상 질문 버튼 영역 */}
      {chatHistory.length > 0 &&
        chatHistory[chatHistory.length - 1].role === 'assistant' &&
        chatHistory[chatHistory.length - 1].predicted_questions?.length > 0 && (
          <div className={styles.predictedQuestionsContainer}>
            {chatHistory[chatHistory.length - 1].predicted_questions.map((q, index) => (
              <button
                key={index}
                className={styles.predictedQuestionButton}
                onClick={() => handlePredictedQuestionClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      {/* [추가된 부분 끝] */}

      <div className={styles.inputArea}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="메시지를 입력..."
          disabled={isLoading}
          ref={inputRef}
        />
        <button onClick={() => handleSendMessage()} disabled={isLoading}>
          전송
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
