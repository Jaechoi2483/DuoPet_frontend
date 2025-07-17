// src/components/common/DuoPetGreeting.js
import React from 'react';
import greetingPhoto from '../../assets/images/greeting/greeting-photo.png';
import styles from './DuoPetGreeting.module.css';

// Google Fonts에서 한글 폰트 import
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const DuoPetGreeting = () => {
  return (
    <div className={styles.greetingContainer}>
      <h1 className={styles.mainTitle}>
        DuoPet, 반려동물과 보호자의 건강한 동행을 위한 플랫폼
      </h1>
      
      <div className={styles.contentWrapper}>
        <div className={styles.imageSection}>
          <img src={greetingPhoto} alt="듀오펫 가족" className={styles.greetingImage} />
        </div>
        
        <div className={styles.textSection}>
          <h2 className={styles.title}>
            당신의 반려동물, 어떤 하루를 보내고 있을까요?
          </h2>
          
          <div className={styles.messageContainer}>
            <p className={styles.message}>
              DuoPet은 반려동물의 건강, 감정, 일상을 더 똑똑하게 돌볼 수 있도록<br/>
              AI 기술과 따뜻한 사람들의 마음을 담아 만든 플랫폼입니다.
            </p>
            
            <p className={styles.message}>
              사진 한 장으로 건강을 진단하고, 이상행동을 실시간으로 감지하며,<br/>
              새로운 가족을 기다리는 친구들도 소개 해 드립니다.<br/>
              전문가 상담, 챗봇, 커뮤니티까지<br/>
              이제 반려생활의 모든 순간을 DuoPet이 함께합니다.
            </p>
            
            <p className={styles.message}>
              DuoPet은 단순한 서비스가 아닌, 반려인들의 삶을 함께 설계하는 파트너입니다.
            </p>
            
            <p className={styles.signature}>
              지금, DuoPet과 함께 하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuoPetGreeting;