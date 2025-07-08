// src/pages/community/freeBoard/FreeBoardList.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FreeBoardList.module.css';

function FreeBoardList() {
  const navigate = useNavigate(); // 초기화

  // 더미 게시글 데이터 (id 포함)
  const topLikedPosts = [
    { id: 1, title: '우리 고양이가 너무 귀여워요', likes: 63 },
    { id: 2, title: '강아지 산책 꿀팁', likes: 52 },
    { id: 3, title: '냥이 화장실 훈련 성공기', likes: 41 },
  ];

  const topViewedPosts = [
    { id: 4, title: '반려동물 건강검진 주기?', views: 189 },
    { id: 5, title: '강아지 예방접종 순서', views: 171 },
    { id: 6, title: '우리집 냥이 관절 관리법', views: 158 },
  ];

  const postList = [
    {
      id: 7,
      title: ' 우리 강아지 배변훈련 성공 스토리',
      writer: '홍길동',
      date: '2025.5.28',
      views: 189,
      likes: 32,
      comments: 7,
    },
    {
      id: 8,
      title: ' 고양이 츄르 종류 추천해주세요',
      writer: '이슬기',
      date: '2025.5.27',
      views: 95,
      likes: 12,
      comments: 3,
    },
    {
      id: 9,
      title: ' 초보 집사들을 위한 준비물 리스트',
      writer: '김철수',
      date: '2025.5.25',
      views: 210,
      likes: 41,
      comments: 10,
    },
  ];

  // 상세페이지 이동 함수
  const handleClick = (id) => {
    navigate(`/community/freeBoard/${id}`);
  };

  return (
    <div className={styles.container}>
      {/* 상단 제목 + 검색/정렬/글쓰기 */}
      <div className={styles.listHeader}>
        <h2 className={styles.title}>커뮤니티 &gt; 자유게시판</h2>
        <div className={styles.listControls}>
          <select>
            <option>최신순</option>
            <option>조회순</option>
          </select>
          <input type="text" placeholder="검색어를 입력하세요" />
          <button className={styles.writeButton}>글쓰기</button>
        </div>
      </div>

      {/* 추천 게시물 */}
      <div className={styles.topSection}>
        <div className={styles.topBox}>
          <h3>🔥 좋아요 많은 글</h3>
          <div className={styles.cardList}>
            {topLikedPosts.map((post) => (
              <div
                key={post.id}
                className={styles.card}
                onClick={() => handleClick(post.id)}
              >
                <span className={styles.badge}>자유게시판</span>
                <p className={styles.cardTitle}>{post.title}</p>
                <p className={styles.cardStats}>❤ {post.likes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.topBox}>
          <h3>👀 조회수 많은 글</h3>
          <div className={styles.cardList}>
            {topViewedPosts.map((post) => (
              <div
                key={post.id}
                className={styles.card}
                onClick={() => handleClick(post.id)}
              >
                <span className={styles.badge}>자유게시판</span>
                <p className={styles.cardTitle}>{post.title}</p>
                <p className={styles.cardStats}>👁‍🗨 {post.views}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 전체 게시글 리스트 */}
      <div className={styles.postList}>
        {postList.map((post) => (
          <div
            key={post.id}
            className={styles.postItem}
            onClick={() => handleClick(post.id)}
          >
            <div className={styles.postTitle}>
              <span className={styles.badge}>자유게시판</span>
              <span>{post.title}</span>
            </div>
            <div className={styles.postMeta}>
              <span>{post.writer}</span> | <span>{post.date}</span> |
              <span>👁 {post.views}</span> <span>❤ {post.likes}</span>{' '}
              <span>💬 {post.comments}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 페이징 */}
      <div className={styles.pagination}>
        <span className={styles.page}>〈</span>
        <span className={`${styles.page} ${styles.active}`}>1</span>
        <span className={styles.page}>2</span>
        <span className={styles.page}>〉</span>
      </div>
    </div>
  );
}

export default FreeBoardList;
