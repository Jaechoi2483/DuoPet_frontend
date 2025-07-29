import React, { useState, useEffect } from 'react';
import styles from './ConsultationNotification.module.css';
import { consultationRoomApi } from '../../api/consultationApi';
import websocketService from '../../services/websocketService';

const ConsultationNotification = ({ notification, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHandled, setIsHandled] = useState(false); // 처리 완료 여부
  const [startTime] = useState(Date.now()); // 알림 시작 시간 저장

  useEffect(() => {
    let timer = null;
    let statusCheckInterval = null;
    
    // WebSocket 상태 변경 구독
    if (websocketService.isConnected() && notification.roomUuid) {
      console.log('[ConsultationNotification] WebSocket 상태 변경 구독 시작');
      websocketService.subscribeToStatusChanges(notification.roomUuid, (statusData) => {
        console.log('[ConsultationNotification] 상태 변경 알림 수신:', statusData);
        
        if (statusData.type === 'STATUS_CHANGE' && statusData.roomUuid === notification.roomUuid) {
          // 타임아웃의 경우 30초가 실제로 지났는지 확인
          if (statusData.status === 'TIMED_OUT') {
            const elapsedTime = (Date.now() - startTime) / 1000;
            console.log('[ConsultationNotification] TIMED_OUT 수신 - 경과 시간:', elapsedTime);
            
            if (elapsedTime < 30) {
              console.log('[ConsultationNotification] 30초 미만 TIMED_OUT 무시');
              return; // 30초가 지나지 않았으면 무시
            }
          }
          
          // 타임아웃, 거절, 취소 등의 경우 알림 닫기
          if (statusData.status === 'TIMED_OUT' || 
              statusData.status === 'REJECTED' || 
              statusData.status === 'CANCELLED') {
            console.log('[ConsultationNotification] 상담이 종료됨:', statusData.status);
            setIsHandled(true);
            clearInterval(timer);
            clearInterval(statusCheckInterval);
            onClose();
          }
        }
      });
    }

    // 타이머 설정
    timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 30초가 지나면 자동으로 알림 닫기
          console.log('[ConsultationNotification] 30초 타임아웃 - 알림 자동 닫기');
          setIsHandled(true);
          clearInterval(statusCheckInterval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 백업 폴링: 5초마다 상담방 상태 체크
    statusCheckInterval = setInterval(async () => {
      try {
        const response = await consultationRoomApi.getConsultationDetailByUuid(notification.roomUuid);
        if (response.success && response.data) {
          const status = response.data.roomStatus;
          console.log('[ConsultationNotification] 상태 체크:', status);
          
          // TIMED_OUT의 경우 30초가 실제로 지났는지 확인
          if (status === 'TIMED_OUT') {
            const elapsedTime = (Date.now() - startTime) / 1000;
            console.log('[ConsultationNotification] 폴링 TIMED_OUT - 경과 시간:', elapsedTime);
            
            if (elapsedTime < 30) {
              console.log('[ConsultationNotification] 30초 미만 폴링 TIMED_OUT 무시');
              return; // 30초가 지나지 않았으면 무시
            }
          }
          
          if (status === 'TIMED_OUT' || status === 'REJECTED' || 
              status === 'CANCELLED' || status === 'IN_PROGRESS') {
            console.log('[ConsultationNotification] 폴링으로 종료 상태 감지:', status);
            setIsHandled(true);
            clearInterval(timer);
            clearInterval(statusCheckInterval);
            onClose();
          }
        }
      } catch (err) {
        console.error('[ConsultationNotification] 상태 체크 실패:', err);
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(statusCheckInterval);
      // WebSocket 구독 해제
      if (websocketService.isConnected() && notification.roomUuid) {
        websocketService.unsubscribeFromStatusChanges(notification.roomUuid);
      }
    };
  }, [notification.roomUuid, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async () => {
    if (isProcessing || isHandled) {
      console.log('[ConsultationNotification] 이미 처리 중이거나 처리 완료됨');
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log('[ConsultationNotification] 상담 승인 API 호출 - roomId:', notification.roomId);
      // 상담 승인 API 호출
      const response = await consultationRoomApi.approveConsultation(notification.roomId);
      console.log('[ConsultationNotification] 승인 API 응답:', response);
      
      setIsHandled(true);
      
      // 알림 닫기
      onClose();
      
      // 채팅 페이지로 이동
      setTimeout(() => {
        window.location.href = `/consultation/chat/${notification.roomUuid}`;
      }, 100);
    } catch (err) {
      console.error('Error approving consultation:', err);
      if (err.response?.status === 400) {
        alert('이미 처리된 상담입니다.');
        onClose();
      } else {
        alert('상담 승인 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing || isHandled) {
      console.log('[ConsultationNotification] 이미 처리 중이거나 처리 완료됨');
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log('[ConsultationNotification] 상담 거절 API 호출 - roomId:', notification.roomId);
      // 상담 거절 API 호출
      const response = await consultationRoomApi.rejectConsultation(notification.roomId);
      console.log('[ConsultationNotification] 거절 API 응답:', response);
      
      setIsHandled(true);
      onClose();
    } catch (err) {
      console.error('Error rejecting consultation:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
        config: err.config
      });
      
      if (err.response?.status === 400) {
        alert('이미 처리된 상담입니다.');
        onClose();
      } else if (err.response?.status === 500) {
        alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (!err.response) {
        alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      } else {
        alert('상담 거절 처리 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>🔔 새로운 상담 요청</h3>
        <div className={styles.timer}>
          <span className={styles.timeLeft}>{timeLeft}</span>초
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.userInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>보호자:</span>
            <span className={styles.value}>{notification.userName || '정보 없음'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>반려동물:</span>
            <span className={styles.value}>
              {notification.petName || '정보 없음'}
              {notification.petInfo && ` (${notification.petInfo})`}
            </span>
          </div>
        </div>

        <div className={styles.symptomSection}>
          <h4 className={styles.symptomTitle}>증상</h4>
          <p className={styles.symptomText}>{notification.chiefComplaint || '증상 정보가 없습니다.'}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.rejectButton} 
          onClick={handleReject} 
          disabled={isProcessing || isHandled || timeLeft === 0}
        >
          거절
        </button>
        <button 
          className={styles.acceptButton} 
          onClick={handleAccept} 
          disabled={isProcessing || isHandled || timeLeft === 0}
        >
          {isProcessing ? '처리 중...' : timeLeft === 0 ? '시간 초과' : '수락'}
        </button>
      </div>
    </div>
  );
};

export default ConsultationNotification;
