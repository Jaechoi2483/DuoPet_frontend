// src/components/common/SessionExtendNotification.js
import React, { useEffect, useState } from 'react';
import styles from './SessionExtendNotification.module.css';

const SessionExtendNotification = ({ onExtend, onDismiss }) => {
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss(); // 자동 닫힘
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className={styles.notification}>
      <div className={styles.message}>
        세션이 곧 만료됩니다.
        <br />
        로그인 시간을 연장하시겠습니까?
      </div>
      <div className={styles.timer}>남은 시간: {secondsLeft}초</div>
      <div className={styles.buttonGroup}>
        <button className={`${styles.button} ${styles.extend}`} onClick={onExtend}>
          연장하기
        </button>
        <button
          className={`${styles.button} ${styles.dismiss}`}
          onClick={() => {
            onDismiss(); // 👈 여기 호출돼야 닫힘!
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default SessionExtendNotification;
