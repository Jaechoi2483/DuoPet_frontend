// src/components/common/DuoPetGreeting.js
import React from 'react';
import logo from '../../assets/images/logo3.png';

const DuoPetGreeting = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      background: '#fff'
    }}>
      <img src={logo} alt="Duopet 로고" style={{ width: '180px', marginBottom: '2rem' }} />
      <h1 style={{ fontWeight: 700, fontSize: '2.2rem', color: '#1597bb', marginBottom: '1.2rem' }}>
        듀오펫에 오신 것을 진심으로 환영합니다!
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.7rem' }}>
        듀오펫은 반려동물과 반려주인 모두의 행복한 삶을 위해 만들어진 플랫폼입니다.<br/>
        여러분의 소중한 반려동물과 함께하는 일상에 듀오펫이 든든한 동반자가 되어드리겠습니다.
      </p>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.7rem' }}>
        건강 관리, 커뮤니티, 전문가 상담 등 다양한 서비스를 통해<br/>
        반려동물과의 특별한 추억을 만들어보세요.
      </p>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.7rem' }}>
        앞으로도 듀오펫은 여러분과 반려동물의 행복을 위해 최선을 다하겠습니다.<br/>
        많은 관심과 사랑 부탁드립니다.
      </p>
    </div>
  );
};

export default DuoPetGreeting;
