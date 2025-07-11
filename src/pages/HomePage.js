import React from 'react';
import AdoptionSlider from '../components/adoption/AdoptionSlider';

const HomePage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: '#333' }}>
        DuoPet에 오신 것을 환영합니다
      </h1>
      
      {/* 입양 동물 슬라이더 섹션 */}
      <AdoptionSlider />
      
      {/* 추가 섹션들을 여기에 배치할 수 있습니다 */}
    </div>
  );
};

export default HomePage;
