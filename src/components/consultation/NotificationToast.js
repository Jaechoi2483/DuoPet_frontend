import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import styles from './NotificationToast.module.css';
import ConsultationNotification from './ConsultationNotification';
import websocketService from '../../services/websocketService';
import { AuthContext } from '../../AuthProvider';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);
  const { user, role } = useContext(AuthContext);

  useEffect(() => {
    // 전문가인 경우에만 WebSocket 연결
    if (role === 'VET' && user?.userNo) {
      // WebSocket 연결
      websocketService.connect('VET', user.userNo).then(() => {
        console.log('WebSocket connected for vet:', user.userNo);
      }).catch(err => {
        console.error('WebSocket connection error:', err);
      });

      // 전역 함수로 알림 표시 함수 등록
      window.showConsultationRequestNotification = (notification) => {
        const newNotification = {
          id: Date.now(),
          ...notification,
          timestamp: new Date()
        };
        setNotifications(prev => [...prev, newNotification]);
      };

      return () => {
        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        websocketService.disconnect();
        delete window.showConsultationRequestNotification;
      };
    }
  }, [role, user]);

  const handleNotificationClose = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // 포털을 사용하여 body에 직접 렌더링
  return ReactDOM.createPortal(
    <div className={styles.toastContainer}>
      {notifications.map((notification) => (
        <div key={notification.id} className={styles.toastItem}>
          <ConsultationNotification
            notification={notification}
            onClose={() => handleNotificationClose(notification.id)}
          />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default NotificationToast;