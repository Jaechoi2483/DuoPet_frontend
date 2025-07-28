import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios';
import styles from './MainTopPosts.module.css';

// 날짜 포맷 함수
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

// 카테고리 -> 한글 라벨 매핑
const convertCategoryToLabel = (category) => {
  switch (category) {
    case 'free':
      return '자유게시판';
    case 'review':
      return '후기게시판';
    case 'question':
      return '질문게시판';
    case 'tip':
      return '팁게시판';
    default:
      return category;
  }
};

function MainTopPosts() {
  const navigate = useNavigate();

  // 좋아요 / 조회수 상위 게시물 상태값
  const [topLiked, setTopLiked] = useState([]);
  const [topViewed, setTopViewed] = useState([]);

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const liked = await apiClient.get('/board/maintop-liked');
        const viewed = await apiClient.get('/board/maintop-viewed');
        setTopLiked(liked.data);
        setTopViewed(viewed.data);
      } catch (err) {
        console.error('TOP 게시글 조회 실패', err);
      }
    };
    fetchTopPosts();
  }, []);

  // 카테고리별 배지 색상 클래스 반환
  const getBadgeStyle = (category) => {
    switch (category) {
      case 'free':
        return styles.freeBadge;
      case 'review':
        return styles.reviewBadge;
      case 'question':
        return styles.questionBadge;
      case 'tip':
        return styles.tipBadge;
      default:
        return '';
    }
  };

  // 단일 게시글 카드 렌더링 함수
  const renderPostCard = (post) => (
    <div
      className={styles.postCard}
      key={post.contentId}
      onClick={() => navigate(`/community/${post.category}/${post.contentId}`)}
    >
      <span className={`${styles.badge} ${getBadgeStyle(post.category)}`}>{convertCategoryToLabel(post.category)}</span>
      <p className={styles.cardTitle}>{post.title}</p>
      <p className={styles.cardMeta}>
        🧑 {post.nickname} | 📅 {formatDate(post.createdAt)}
      </p>
      <p className={styles.cardStats}>
        ❤️ {post.likeCount} &nbsp;&nbsp; 👁 {post.viewCount}
      </p>
    </div>
  );

  // 전체 렌더링 구조
  return (
    <div className={styles.mainTopPostsContainer}>
      {/* 좋아요 TOP 3 */}
      <div className={styles.topBox}>
        <h3>🔥 좋아요 많은 글</h3>
        {topLiked.map(renderPostCard)}
      </div>

      {/* 조회수 TOP 3 */}
      <div className={styles.topBox}>
        <h3>👁️ 조회수 많은 글</h3>
        {topViewed.map(renderPostCard)}
      </div>
    </div>
  );
}

export default MainTopPosts;
