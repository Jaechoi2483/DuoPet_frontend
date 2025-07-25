import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ConsultationChat.module.css';
import { AuthContext } from '../../AuthProvider';
import { consultationRoomApi, chatMessageApi } from '../../api/consultationApi';
import websocketService from '../../services/websocketService';

const ConsultationChat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  
  const [roomInfo, setRoomInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 상담방 정보 로드
  useEffect(() => {
    const loadRoomInfo = async () => {
      try {
        const data = await consultationRoomApi.getConsultationDetail(roomId);
        setRoomInfo(data);
        
        // 상담 시작 처리
        if (data.status === 'APPROVED') {
          await consultationRoomApi.startConsultation(roomId);
        }
      } catch (err) {
        console.error('Error loading room info:', err);
        setError('상담방 정보를 불러올 수 없습니다.');
      }
    };
    
    loadRoomInfo();
  }, [roomId]);
  
  // 채팅 이력 로드
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await chatMessageApi.getChatHistory(roomId);
        setMessages(history.content || []);
      } catch (err) {
        console.error('Error loading chat history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadChatHistory();
  }, [roomId]);
  
  // WebSocket 연결 및 구독
  useEffect(() => {
    if (!user) return;
    
    // WebSocket 연결
    const connectWebSocket = async () => {
      try {
        await websocketService.connect(role, user.userNo);
        
        // 상담방 구독
        websocketService.subscribeToRoom(roomId, {
          onMessage: (message) => {
            setMessages(prev => [...prev, message]);
            // 읽음 처리
            chatMessageApi.markAsRead(roomId);
          },
          onTyping: (data) => {
            if (data.userId !== user.userNo) {
              setOtherUserTyping(data.isTyping);
            }
          },
          onStatusChange: (data) => {
            if (data.status === 'ENDED') {
              alert('상담이 종료되었습니다.');
              navigate('/mypage/consultations');
            }
          }
        });
      } catch (err) {
        console.error('WebSocket connection error:', err);
      }
    };
    
    connectWebSocket();
    
    return () => {
      websocketService.unsubscribeFromRoom(roomId);
    };
  }, [roomId, user, role, navigate]);
  
  // 메시지 전송
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // 임시 메시지 추가 (낙관적 업데이트)
    const tempMessage = {
      id: Date.now(),
      content: messageContent,
      senderId: user.userNo,
      senderName: user.name || user.userName,
      timestamp: new Date().toISOString(),
      messageType: 'TEXT',
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      // WebSocket으로 메시지 전송
      websocketService.sendMessage(roomId, messageContent);
    } catch (err) {
      console.error('Error sending message:', err);
      // 실패 시 임시 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      alert('메시지 전송에 실패했습니다.');
    }
  };
  
  // 타이핑 상태 전송
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      websocketService.sendTypingStatus(roomId, true);
    }
    
    // 타이핑 중지 감지
    clearTimeout(window.typingTimer);
    window.typingTimer = setTimeout(() => {
      setIsTyping(false);
      websocketService.sendTypingStatus(roomId, false);
    }, 1000);
  };
  
  // 상담 종료
  const handleEndConsultation = async () => {
    if (!window.confirm('상담을 종료하시겠습니까?')) return;
    
    try {
      await consultationRoomApi.endConsultation(roomId);
      navigate('/mypage/consultations');
    } catch (err) {
      console.error('Error ending consultation:', err);
      alert('상담 종료에 실패했습니다.');
    }
  };
  
  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  
  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>실시간 상담</h2>
          {roomInfo && (
            <div className={styles.roomInfo}>
              <span className={styles.petInfo}>
                {role === 'VET' ? roomInfo.petName : roomInfo.vetName}
              </span>
              {roomInfo.chiefComplaint && (
                <span className={styles.complaint}>{roomInfo.chiefComplaint}</span>
              )}
            </div>
          )}
        </div>
        <button 
          className={styles.endButton}
          onClick={handleEndConsultation}
        >
          상담 종료
        </button>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`${styles.message} ${
              message.senderId === user.userNo ? styles.myMessage : styles.otherMessage
            } ${message.isTemp ? styles.tempMessage : ''}`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.senderName}>{message.senderName}</span>
              <span className={styles.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className={styles.messageContent}>{message.content}</div>
          </div>
        ))}
        
        {otherUserTyping && (
          <div className={styles.typingIndicator}>
            <span>상대방이 입력 중입니다...</span>
            <div className={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className={styles.inputForm} onSubmit={handleSendMessage}>
        <input
          ref={messageInputRef}
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="메시지를 입력하세요..."
          className={styles.messageInput}
        />
        <button 
          type="submit"
          className={styles.sendButton}
          disabled={!newMessage.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
};

export default ConsultationChat;