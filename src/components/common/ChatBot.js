import React, { useState, useEffect, useRef, useContext } from 'react';
import apiClient from '../../utils/axios';
import styles from './Chatbot.module.css';
import { AuthContext } from '../../AuthProvider';

function ChatBot({ isOpen, onClose, hideClose }) {
  const { userNo, isLoggedIn, isAuthLoading } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setChatHistory([
      {
        role: 'assistant',
        content: '안녕하세요! DuoPet에 대해 무엇이든 물어보세요.',
      },
    ]);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

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

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    const userMessage = { role: 'user', content: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setMessage('');

    try {
      // ❗ 1. AI 서버의 전체 URL을 직접 지정합니다. (포트 8000)
      const aiServerUrl = 'http://localhost:8000/api/v1/chatbot/chat';

      // ❗ 2. AI 서버용 API 키를 정의합니다.
      // (실제로는 .env 파일 등에서 안전하게 관리하는 것을 권장합니다.)
      const apiKey = 'DUOPET_DEV_MASTER_KEY';

      // ❗ 3. apiClient.post 호출 시 세 번째 인자로 'config' 객체를 전달합니다.
      //    이 config는 이번 요청에만 적용됩니다.
      const response = await apiClient.post(
        aiServerUrl, // 💡 전체 URL 사용
        {
          message: message,
          user_id: isLoggedIn ? String(userNo) : '0',
        },
        {
          // 💡 헤더에 API 키를 추가하여 인증 문제를 해결합니다.
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
          actions: aiResponseData.suggested_actions,
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
      console.error('Axios 응답 에러 : ', error); // 디버깅을 위해 에러 로그 유지
      const networkError = {
        role: 'assistant',
        content: '챗봇 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
      };
      setChatHistory((prev) => [...prev, networkError]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictedQuestionClick = (question) => {
    // 메시지 입력창에 질문을 채워주고, 바로 전송할 수도 있습니다.
    setMessage(question);
    // 즉시 전송을 원하면 아래 주석을 해제하세요.
    // handleSendMessage();
  };

  return (
    <div className={styles.chatbotContainer}>
      {!hideClose && (
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      )}
      <div className={styles.chatWindow}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
            <div className={styles.bubble}>
              {msg.content}
              {msg.actions && msg.actions.length > 0 && (
                <div className={styles.actionsContainer}>
                  {msg.actions.map((action) => (
                    <a
                      href={action.url}
                      key={action.name}
                      className={styles.actionButton}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {action.description}
                    </a>
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
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          전송
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
