import React from 'react';
import logo from '../assets/images/logo3.png';
import logo1 from '../assets/images/logo1.png';

const GreetingPage = () => {
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
      {/* 인사말 이미지 및 텍스트 */}
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

      {/* 사이트 소개 섹션 */}
      <div style={{ marginTop: '3rem', width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={logo1} alt="Duopet 소개 로고" style={{ width: '120px', marginBottom: '1.5rem' }} />
        <h2 style={{ fontWeight: 600, fontSize: '1.5rem', color: '#1597bb', marginBottom: '1rem' }}>사이트 소개</h2>
        <div style={{ fontSize: '1.05rem', color: '#444', lineHeight: 1.7 }}>
          <p style={{ marginBottom: '0.7rem' }}>
            듀오펫은 반려동물과 반려주인 모두의 행복한 삶을 위해 만들어진 플랫폼입니다.<br/>
            여러분의 소중한 반려동물과 함께하는 일상에 듀오펫이 든든한 동반자가 되어드리겠습니다.
          </p>
          <p style={{ marginBottom: '0.7rem' }}>
            건강 관리, 커뮤니티, 전문가 상담 등 다양한 서비스를 통해<br/>
            반려동물과의 특별한 추억을 만들어보세요.
          </p>
          <p style={{ marginBottom: '0.7rem' }}>
            앞으로도 듀오펫은 여러분과 반려동물의 행복을 위해 최선을 다하겠습니다.<br/>
            많은 관심과 사랑 부탁드립니다.
          </p>
          <p style={{ marginBottom: '0.7rem' }}>
            듀오펫은 단순한 정보 제공을 넘어, 반려동물과 보호자가 함께 성장하고 소통할 수 있는 공간을 지향합니다.<br/>
            앞으로도 다양한 기능과 서비스를 지속적으로 확장하여, 모두가 만족할 수 있는 플랫폼이 되겠습니다.
          </p>
          <p style={{ marginBottom: '0.7rem' }}>
            듀오펫과 함께라면, 반려동물과의 매일이 더욱 특별해집니다.<br/>
            언제나 여러분 곁에서 든든한 친구가 되어드릴 것을 약속드립니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreetingPage;
