import React from 'react';
import logo1 from '../assets/images/logo1.png';

const AboutPage = () => {
  return (
    <div style={{
      minHeight: '70vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      textAlign: 'center',
      padding: '2rem',
      background: '#fff'
    }}>
      {/* 왼쪽 상단 고정 로고 */}
      <img src={logo1} alt="Duopet 소개 로고"
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          width: '120px',
          maxWidth: '30vw',
          height: 'auto',
          zIndex: 2
        }}
      />
      {/* 사이트 소개 텍스트와 본문 */}
      <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#1597bb', marginBottom: '1.2rem', maxWidth: '90vw', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
          사이트 소개
        </h1>
        <div style={{ fontSize: '1.08rem', color: '#444', lineHeight: 1.7, maxWidth: 520 }}>
          <p style={{ marginBottom: '0.7rem' }}>
            <b>듀오펫</b>은 반려동물과 반려주인 모두의 행복한 삶을 위해 만들어진 종합 플랫폼입니다.<br/>
            건강 관리, 커뮤니티, 전문가 상담 등 다양한 서비스를 한 곳에서 경험할 수 있습니다.
          </p>
          <p style={{ marginBottom: '0.7rem' }}>
            <b>주요 서비스</b><br/>
            - 반려동물 건강 기록 및 AI 기반 진단<br/>
            - 산책, 예방접종, 체중 등 맞춤형 건강 관리<br/>
            - 자유게시판, 후기, 팁 등 커뮤니티 소통<br/>
            - 수의사, 전문가와의 1:1 상담<br/>
            - 위치기반 병원/카페/미용실 정보 제공<br/>
          </p>
          <p style={{ marginBottom: '0.7rem' }}>
            <b>듀오펫의 가치</b><br/>
            듀오펫은 반려동물과 보호자가 함께 성장하고, 서로 소통하며, 더 나은 삶을 만들어가는 것을 목표로 합니다.<br/>
            모든 반려동물 가족이 신뢰할 수 있는 정보를 얻고, 따뜻한 커뮤니티를 경험할 수 있도록 노력합니다.
          </p>
          <p style={{ marginBottom: '0.7rem' }}>
            <b>비전</b><br/>
            듀오펫은 단순한 정보 제공을 넘어, 반려동물과 보호자가 함께 행복한 미래를 만들어가는 동반자가 되고자 합니다.<br/>
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

export default AboutPage; 