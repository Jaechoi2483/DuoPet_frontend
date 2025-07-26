import React, { useState, useEffect } from 'react';
import styles from './ConsultationNotification.module.css';
import { consultationRoomApi } from '../../api/consultationApi';

const ConsultationNotification = ({ notification, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleReject(); // 자동 거절
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      // 상담 승인 API 호출
      await consultationRoomApi.approveConsultation(notification.roomId);

      // 채팅 페이지로 이동
      window.location.href = `/consultation/chat/${notification.roomUuid}`;
    } catch (err) {
      console.error('Error approving consultation:', err);
      alert('상담 승인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      // 상담 거절 API 호출
      await consultationRoomApi.rejectConsultation(notification.roomId);
      onClose();
    } catch (err) {
      console.error('Error rejecting consultation:', err);
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
        <button className={styles.rejectButton} onClick={handleReject} disabled={isProcessing}>
          거절
        </button>
        <button className={styles.acceptButton} onClick={handleAccept} disabled={isProcessing}>
          {isProcessing ? '처리 중...' : '수락'}
        </button>
      </div>
    </div>
  );
};

export default ConsultationNotification;
