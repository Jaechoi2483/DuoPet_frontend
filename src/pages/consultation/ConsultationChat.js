// src/pages/consultation/ConsultationChat.js (전체 교체)
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ConsultationChat.module.css';
import { AuthContext } from '../../AuthProvider';
import { consultationRoomApi, chatMessageApi } from '../../api/consultationApi';
import websocketService from '../../services/websocketService';
import Loading from '../../components/common/Loading';

const ConsultationChat = () => {
  // 💡 1. useParams에서 roomId 대신 roomUuid를 가져옵니다.
  const { roomUuid } = useParams();
  const navigate = useNavigate();
  // AuthContext에서 직접 속성들을 가져옵니다
  const authContext = useContext(AuthContext) || {};
  const { isLoggedIn, role, username, userid, userNo } = authContext;
  const messagesEndRef = useRef(null);
  
  // localStorage에서 loginId와 userId 가져오기 (비교를 위해)
  const loginId = localStorage.getItem('loginId') || userid; // userid는 JWT에서 파싱한 loginId
  const userId = localStorage.getItem('userId');

  const [roomInfo, setRoomInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoomAndMessages = async () => {
      console.log('[ConsultationChat] loadRoomAndMessages 시작, roomUuid:', roomUuid);
      
      if (!roomUuid) {
        setError('유효하지 않은 상담방 ID입니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 💡 2. roomUuid를 사용하여 상담방 상세 정보를 가져옵니다.
        // API 서비스 파일(consultationApi.js)에 이 함수가 있어야 합니다.
        console.log('[ConsultationChat] API 호출 전');
        const roomDataResponse = await consultationRoomApi.getConsultationDetailByUuid(roomUuid);
        console.log('[ConsultationChat] API 응답:', roomDataResponse);

        if (roomDataResponse.success) {
          const roomData = roomDataResponse.data;
          setRoomInfo(roomData);

          // 💡 3. 전문가가 수락 직후 들어왔을 때, 상태가 WAITING이면 IN_PROGRESS로 변경합니다.
          if ((role === 'VET' || role === 'vet') && (roomData.roomStatus === 'WAITING' || roomData.roomStatus === 'CREATED')) {
            await consultationRoomApi.startConsultation(roomData.roomId);
            // 상태 변경 후 정보를 다시 불러와도 좋지만, 일단 진행합니다.
            setRoomInfo((prev) => ({ ...prev, roomStatus: 'IN_PROGRESS' }));
          }

          // 💡 4. 숫자 roomId를 사용하여 채팅 내역을 불러옵니다.
          console.log('[ConsultationChat] 채팅 내역 조회, roomId:', roomData.roomId);
          const historyResponse = await chatMessageApi.getChatHistory(roomData.roomId);
          console.log('[ConsultationChat] 채팅 내역 응답:', historyResponse);
          
          // 응답 구조에 따라 메시지 처리
          if (historyResponse && historyResponse.data) {
            const messages = historyResponse.data.content || historyResponse.data || [];
            setMessages(Array.isArray(messages) ? messages.reverse() : []);
          } else {
            setMessages([]);
          }
        } else {
          throw new Error(roomDataResponse.message);
        }
      } catch (err) {
        console.error('상담방 정보 또는 메시지 로딩 실패:', err);
        setError('상담방 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadRoomAndMessages();
  }, [roomUuid, navigate, role]);

  useEffect(() => {
    // 웹소켓 연결 및 구독 로직
    if (!isLoggedIn || !roomInfo) return;

    console.log('[ConsultationChat] WebSocket 연결 시작');
    
    // WebSocket이 이미 연결되어 있는지 확인
    if (websocketService.isConnected()) {
      console.log('[ConsultationChat] WebSocket 이미 연결됨, 구독 시작');
      // 💡 5. roomUuid를 사용하여 특정 채팅방 채널을 구독합니다.
      websocketService.subscribeToRoom(roomInfo.roomUuid, {
        onMessage: (message) => {
          console.log('[ConsultationChat] 새 메시지 수신:', message);
          console.log('[ConsultationChat] 현재 사용자 정보:', {
            userNo,
            userid,
            loginId,
            username,
            userId
          });
          console.log('[ConsultationChat] 메시지 전송자 정보:', {
            senderId: message.senderId,
            senderUsername: message.senderUsername,
            senderName: message.senderName
          });
          setMessages((prev) => [...prev, message]);
        },
      });
    } else {
      console.log('[ConsultationChat] WebSocket 연결 필요');
      // WebSocket 연결이 필요한 경우 (일반적으로 App.js에서 이미 연결됨)
    }

    return () => {
      if (websocketService.isConnected() && roomInfo) {
        websocketService.unsubscribeFromRoom(roomInfo.roomUuid);
      }
    };
  }, [roomUuid, isLoggedIn, roomInfo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && roomInfo) {
      console.log('[ConsultationChat] 메시지 전송:', newMessage.trim());
      console.log('[ConsultationChat] roomUuid:', roomInfo.roomUuid);
      console.log('[ConsultationChat] userNo:', userNo);
      // roomUuid를 사용하여 메시지 전송
      websocketService.sendMessage(roomInfo.roomUuid, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleEndConsultation = async () => {
    if (window.confirm('상담을 종료하시겠습니까?')) {
      try {
        await consultationRoomApi.endConsultation(roomInfo.roomId);
        alert('상담이 종료되었습니다.');
        navigate('/mypage/consultations');
      } catch (err) {
        alert('상담 종료 중 오류가 발생했습니다.');
      }
    }
  };

  // 메시지 시간 포맷팅 함수
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className={styles.errorContainer}>{error}</div>;
  if (!roomInfo) return <div className={styles.errorContainer}>상담 정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
        <h2 className={styles.title}>실시간 상담</h2>
        <div className={styles.roomInfo}>
          <span className={styles.petInfo}>{(role === 'VET' || role === 'vet') ? roomInfo.userName : roomInfo.vetName}</span>
          <span className={styles.complaint}>{roomInfo.chiefComplaint}</span>
        </div>
        <button className={styles.endButton} onClick={handleEndConsultation}>
          상담 종료
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={message.messageId || index}
            className={`${styles.message} ${
              // senderUsername(백엔드에서 loginId 전송)과 현재 사용자의 loginId/userid 비교
              (message.senderUsername && (message.senderUsername === userid || message.senderUsername === loginId)) ||
              (message.senderName && message.senderName === username)
                ? styles.myMessage 
                : styles.otherMessage
            }`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.senderName}>{message.senderName}</span>
            </div>
            <div className={styles.messageContent}>{message.content}</div>
            <span className={styles.timestamp}>
              {formatMessageTime(message.sentAt)}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputForm} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton} disabled={!newMessage.trim()}>
          전송
        </button>
      </form>
    </div>
    </div>
  );
};

export default ConsultationChat;
