import React, { useEffect } from 'react';
import logo1 from '../assets/images/logo1.png';
import dogAndKitten from '../assets/images/dog_and_kitten001.png';
import dog01 from '../assets/images/dog01.png';
import kitten01 from '../assets/images/kitten01.png';

const AboutPage = () => {
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  const mainImageStyle = {
    width: '220px',
    maxWidth: '90vw',
    height: 'auto',
    borderRadius: '32px',
    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
    margin: '36px auto',
    display: 'block',
    background: '#fff',
    border: 'none',
    objectFit: 'cover',
  };
  const sideImageStyle = {
    width: '130px',
    maxWidth: '30vw',
    height: 'auto',
    borderRadius: '18px',
    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
    background: '#fff',
    objectFit: 'cover',
    margin: '0',
    flexShrink: 0,
  };

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '48px 10px',
      background: '#ffffff',
      fontFamily: 'Pretendard, sans-serif',
      color: '#222'
    }}>
      <h1 style={{
        fontSize: '2.8em',
        fontWeight: 'bold',
        marginBottom: '36px',
        color: '#283593',
        letterSpacing: '0.08em',
        fontFamily: 'Pretendard, sans-serif',
        marginTop: '36px'
      }}>
        사이트 소개
      </h1>
      <img
        src={dogAndKitten}
        alt="강아지와 고양이"
        style={mainImageStyle}
      />
      <div style={{
        maxWidth: 700,
        fontSize: '1.18em',
        lineHeight: 2.1,
        margin: '0 auto 36px auto',
        whiteSpace: 'pre-line',
        fontWeight: 500,
        fontFamily: 'Pretendard, sans-serif'
      }}>
        {`듀오펫은 반려동물과 반려주인 모두의 행복한 삶을 위해 만들어진 종합 플랫폼입니다.\n\n저희는 건강 관리, 커뮤니티, 전문가 상담 등 다양한 서비스를 한 곳에서 제공하여, 반려동물의 건강과 행복, 그리고 보호자의 편리한 일상을 지원합니다.\n\n듀오펫에서는 AI 기반 건강 진단, 맞춤형 건강 관리, 다양한 커뮤니티 소통 공간, 그리고 수의사 및 전문가와의 1:1 상담 등 반려동물과 보호자 모두에게 꼭 필요한 서비스를 경험하실 수 있습니다.\n\n앞으로도 듀오펫은 반려동물과 보호자의 더 나은 삶을 위해 지속적으로 서비스를 발전시키고, 새로운 기능을 제공할 것을 약속드립니다.`}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          maxWidth: 900,
          margin: '0 auto',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        <img
          src={dog01}
          alt="강아지"
          style={sideImageStyle}
        />
        <div style={{
          maxWidth: 520,
          margin: '0 12px',
          fontSize: '1.18em',
          lineHeight: 2.3,
          textAlign: 'center',
          background: 'none',
          fontWeight: 400,
          fontFamily: 'Pretendard, sans-serif',
          flex: 1,
        }}>
          <div style={{textAlign: 'center', fontWeight: 'bold', marginBottom: '16px', fontSize: '1.15em'}}>주요 서비스</div>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, textAlign: 'center'}}>
            <li style={{marginBottom: '12px'}}>반려동물 건강 기록 및 AI 기반 진단</li>
            <li style={{marginBottom: '12px'}}>산책, 예방접종, 체중 등 맞춤형 건강 관리</li>
            <li style={{marginBottom: '12px'}}>자유게시판, 후기, 팁 등 커뮤니티 소통</li>
            <li>수의사, 전문가와의 1:1 상담</li>
          </ul>
        </div>
        <img
          src={kitten01}
          alt="고양이"
          style={sideImageStyle}
        />
      </div>
    </div>
  );
};

export default AboutPage; 