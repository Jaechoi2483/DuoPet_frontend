import React from 'react';
import ReactDOM from 'react-dom';
import styles from './NotificationToast.module.css';
import ConsultationNotification from './ConsultationNotification';

const NotificationToast = ({ notification, onClose }) => {
  // notification이 없으면 렌더링하지 않음
  if (!notification) {
    return null;
  }

  // 포털을 사용하여 body에 직접 렌더링
  return ReactDOM.createPortal(
    <div className={styles.toastContainer}>
      <div className={styles.toastItem}>
        <ConsultationNotification
          notification={notification}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
};

export default NotificationToast;