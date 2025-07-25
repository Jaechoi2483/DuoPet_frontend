import React, { useEffect } from 'react';
import greetingPhoto from '../assets/images/greeting/greeting-photo.png';

const GreetingPage = () => {
  useEffect(() => {
    // Google Fonts 동적 로드
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    return () => {
      // cleanup: 컴포넌트 언마운트 시 폰트 링크 제거
      if (document.head.contains(fontLink)) {
        document.head.removeChild(fontLink);
      }
    };
  }, []);

  // 스타일 객체들
  const styles = {
    greetingContainer: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: '#ffffff',
      padding: '2rem',
      paddingTop: '120px',
    },
    mainTitle: {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '3.1rem',
      fontWeight: 700,
      color: '#333',
      textAlign: 'center',
      marginBottom: '3.75rem',
      letterSpacing: '-1px',
    },
    contentWrapper: {
      maxWidth: '1500px',
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '5rem',
      alignItems: 'flex-start',
      backgroundColor: '#ffffff',
      padding: '3.75rem',
      borderRadius: '20px',
      boxShadow: '0 12px 38px rgba(0, 0, 0, 0.05)',
    },
    imageSection: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    greetingImage: {
      width: '100%',
      maxWidth: '625px',
      height: 'auto',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
    },
    greetingImageHover: {
      transform: 'scale(1.02)',
    },
    textSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.9rem',
      paddingTop: 0,
    },
    title: {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '2.25rem',
      fontWeight: 600,
      color: '#333',
      margin: 0,
      lineHeight: 1.4,
      letterSpacing: '-0.8px',
    },
    messageContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.9rem',
      marginTop: '1.25rem',
    },
    message: {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '1.31rem',
      fontWeight: 400,
      color: '#555',
      lineHeight: 1.8,
      margin: 0,
      letterSpacing: '-0.3px',
    },
    signature: {
      fontFamily: "'Noto Sans KR', sans-serif",
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#4285F4',
      marginTop: '1.9rem',
      letterSpacing: '-0.5px',
    },
  };

  // 이미지 호버 상태 관리
  const [isImageHovered, setIsImageHovered] = React.useState(false);

  // 화면 크기에 따른 반응형 스타일 적용
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 모바일 스타일 오버라이드
  const mobileStyles = {
    mainTitle: {
      fontSize: '2rem',
    },
    contentWrapper: {
      gridTemplateColumns: '1fr',
      gap: '3rem',
      padding: '2rem',
    },
    greetingImage: {
      maxWidth: '100%',
    },
    title: {
      fontSize: '1.5rem',
    },
    message: {
      fontSize: '1rem',
    },
    signature: {
      fontSize: '1.2rem',
    },
  };

  // 스타일 병합 함수
  const getStyle = (styleName) => {
    return isMobile && mobileStyles[styleName] 
      ? { ...styles[styleName], ...mobileStyles[styleName] }
      : styles[styleName];
  };

  return (
    <div style={styles.greetingContainer}>
      <h1 style={getStyle('mainTitle')}>
        DuoPet, 반려동물과 보호자의 건강한 동행을 위한 플랫폼
      </h1>
      
      <div style={getStyle('contentWrapper')}>
        <div style={styles.imageSection}>
          <img 
            src={greetingPhoto} 
            alt="듀오펫 가족" 
            style={{
              ...getStyle('greetingImage'),
              ...(isImageHovered ? styles.greetingImageHover : {})
            }}
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          />
        </div>
        
        <div style={styles.textSection}>
          <h2 style={getStyle('title')}>
            당신의 반려동물, 어떤 하루를 보내고 있을까요?
          </h2>
          
          <div style={styles.messageContainer}>
            <p style={getStyle('message')}>
              DuoPet은 반려동물의 건강, 감정, 일상을 더 똑똑하게 돌볼 수 있도록<br/>
              AI 기술과 따뜻한 사람들의 마음을 담아 만든 플랫폼입니다.
            </p>
            
            <p style={getStyle('message')}>
              사진 한 장으로 건강을 진단하고, 이상행동을 실시간으로 감지하며,<br/>
              새로운 가족을 기다리는 친구들도 소개 해 드립니다.<br/>
              전문가 상담, 챗봇, 커뮤니티까지<br/>
              이제 반려생활의 모든 순간을 DuoPet이 함께합니다.
            </p>
            
            <p style={getStyle('message')}>
              DuoPet은 단순한 서비스가 아닌, 반려인들의 삶을 함께 설계하는 파트너입니다.
            </p>
            
            <p style={getStyle('signature')}>
              지금, DuoPet과 함께 하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingPage;