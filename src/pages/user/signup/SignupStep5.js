// src/pages/user/signup/SignupStep5.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupStep1.module.css';

const SignupStep5 = () => {
  const navigate = useNavigate();

  // 반려동물 등록 페이지로 이동하며 userId 전달
  const handleRegisterPet = () => {
    const userId = localStorage.getItem('userId');
    console.log('[Step5] localStorage에서 가져온 userId:', userId);

    if (!userId) {
      alert('유저 정보가 유실되었습니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    navigate('/user/pet/register', {
      state: { userId },
    });
  };

  // 나중에 등록할 경우 로그인 페이지로 이동
  const handleSkip = () => {
    alert('언제든지 마이페이지 > 반려동물 관리에서 등록할 수 있어요!');
    navigate('/login');
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>🎉 회원가입이 완료되었습니다! 🎉</h2>
      <p className={styles.subtitle}>이제 반려동물의 정보를 등록해보세요.</p>

      <div className={styles.petInfoBox}>
        <p className={styles.highlight}>등록은 선택 사항이며,</p>
        <p>언제든지 마이페이지에서 추가/수정할 수 있어요.</p>
        <p className={styles.smallNotice}>※ 마이페이지 &gt; 반려동물 관리 에서 등록 가능합니다</p>
      </div>

      <div className={styles.buttonGroup}>
        <button className={`${styles.nextButton} ${styles.fullButton}`} onClick={handleRegisterPet}>
          반려동물 등록
        </button>
        <button className={`${styles.secondaryButton} ${styles.fullButton}`} onClick={handleSkip}>
          건너뛰기
        </button>
      </div>
    </div>
  );
};

export default SignupStep5;
