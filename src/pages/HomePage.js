import React from 'react';
import AdoptionSlider from '../components/adoption/AdoptionSlider';
import RecentNotices from '../components/notice/RecentNotices';

import MainTopPosts from '../components/mainTopPosts/MainTopPosts';

import ShoppingSection from '../components/Shopping/ShoppingSection';


const HomePage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: '#333' }}>DuoPet에 오신 것을 환영합니다</h1>

      {/* 입양 동물 슬라이더 섹션 */}
      <AdoptionSlider />

      {/* 추가 섹션들을 여기에 배치할 수 있습니다 */}
      <RecentNotices />


      {/* 메인 인기 게시글 섹션 */}
      <MainTopPosts />

      <ShoppingSection />

    </div>
  );
};

export default HomePage;
