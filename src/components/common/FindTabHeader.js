import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './FindIDAndPWD.module.css';

const FindTabHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isIdPage = location.pathname === '/find-id';

  return (
    <div>
      <h2 className={styles.title}>계정 찾기</h2>
      <p className={styles.subtitle}>아이디 또는 비밀번호를 잊으셨나요?</p>
      <div className={styles.tabMenu}>
        <div className={`${styles.tabItem} ${isIdPage ? styles.active : ''}`} onClick={() => navigate('/find-id')}>
          아이디 찾기
        </div>
        <div
          className={`${styles.tabItem} ${!isIdPage ? styles.active : ''}`}
          onClick={() => navigate('/find-password')}
        >
          비밀번호 찾기
        </div>
      </div>
    </div>
  );
};

export default FindTabHeader;
