// src/pages/SessionExpired.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SessionExpired.module.css';

const SessionExpired = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.expiredContainer}>
      <h2 className={styles.title}>로그인 유지시간이 만료되어 자동으로 로그아웃 되었습니다.</h2>
      <p className={styles.sub}>DuoPet 서비스를 이용해 주셔서 감사합니다.</p>
      <p className={styles.desc}>계속 사용하려면 다시 로그인해주세요.</p>

      <div className={styles.buttonGroup}>
        <button onClick={() => navigate('/')} className={styles.homeBtn}>
          홈으로
        </button>
        <button onClick={() => navigate('/login')} className={styles.loginBtn}>
          다시 로그인하기
        </button>
      </div>
    </div>
  );
};

export default SessionExpired;
