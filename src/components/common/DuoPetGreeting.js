// src/components/common/DuoPetGreeting.js
import React from 'react';
import logo from '../../assets/images/logo3.png';
import styles from './DuoPetGreeting.module.css';

// Google Fonts에서 귀여운 한글 폰트 import
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&family=Single+Day&family=Hi+Melody&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const DuoPetGreeting = () => {
  return (
    <div className={styles.greetingContainer}>
      <div className={styles.logoSection}>
        <img src={logo} alt="Duopet 로고" className={styles.logo} />
      </div>
      
      <div className={styles.contentSection}>
        <h1 className={styles.title}>
          듀오펫에 오신 것을 진심으로 환영합니다!
        </h1>
        
        <div className={styles.messageContainer}>
          <p className={styles.message}>
            듀오펫은 반려동물과 반려주인 모두의 행복한 삶을 위해 만들어진 플랫폼입니다.<br/>
            여러분의 소중한 반려동물과 함께하는 일상에 듀오펫이 든든한 동반자가 되어드리겠습니다.
          </p>
          
          <p className={styles.message}>
            건강 관리, 커뮤니티, 전문가 상담 등 다양한 서비스를 통해<br/>
            반려동물과의 특별한 추억을 만들어보세요.
          </p>
          
          <p className={styles.message}>
            앞으로도 듀오펫은 여러분과 반려동물의 행복을 위해 최선을 다하겠습니다.<br/>
            많은 관심과 사랑 부탁드립니다.
          </p>
        </div>
        
        <div className={styles.pawPrints}>
          <span className={styles.paw}>🐾</span>
          <span className={styles.paw}>🐾</span>
          <span className={styles.paw}>🐾</span>
        </div>
      </div>
    </div>
  );
};

export default DuoPetGreeting;
