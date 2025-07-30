// src/pages/mypage/components/activity/MyLikes.js

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyPosts.module.css';
import heartStyles from './HeartButton.module.css';
import { AuthContext } from '../../../../AuthProvider';
import apiClient from '../../../../utils/axios';

const MyLikes = () => {
  const { userNo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [likes, setLikes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    if (!userNo) return;
    apiClient
      .get('/mypage/likes', { params: { userId: userNo } })
      .then((res) => {
        const data = res.data || [];
        setLikes(data.map((item) => ({ ...item, liked: true }))); // 기본 liked true
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      })
      .catch((err) => console.error('좋아요한 게시글 불러오기 실패:', err));
  }, [userNo]);

  const toggleLike = async (contentId) => {
    try {
      const res = await apiClient.post(`/mypage/like/${contentId}`, null, {
        headers: { userid: userNo },
      });

      const { liked } = res.data; // 서버가 true or false 반환

      setLikes((prevLikes) =>
        prevLikes.map((item) =>
          item.contentId === contentId
            ? {
                ...item,
                liked, // 상태 반영
                likeCount: liked ? item.likeCount + 1 : Math.max(item.likeCount - 1, 0), // 음수 방지
              }
            : item
        )
      );

      // 사용자에게 피드백
      setToastMessage(liked ? '게시글에 좋아요를 눌렀습니다.' : '게시글 좋아요를 취소했습니다.');
      setTimeout(() => setToastMessage(''), 2000);
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    }
  };

  const handlePostClick = (item) => {
    const boardTypePath =
      {
        free: 'freeBoard',
        review: 'reviewBoard',
        tip: 'tipBoard',
        question: 'questionBoard',
      }[item.category] || 'freeBoard';

    navigate(`/community/${boardTypePath}/${item.contentId}`);
  };

  const getBoardTypeLabel = (type) => {
    switch (type) {
      case 'free':
        return '자유게시판';
      case 'tip':
        return '팁게시판';
      case 'review':
        return '후기게시판';
      case 'question':
        return '질문게시판';
      default:
        return type || '기타';
    }
  };

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return likes.slice(start, start + itemsPerPage);
  };

  return (
    <div className={styles.myPostsContainer}>
      {likes.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>좋아요한 게시글이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className={styles.postList}>
            {getCurrentPageItems().map((item) => (
              <div
                key={item.contentId}
                className={styles.postItem}
                onClick={() => handlePostClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.postHeader}>
                  <span className={styles.boardType}>[{getBoardTypeLabel(item.category)}]</span>
                  <h3 className={styles.postTitle}>{item.title}</h3>
                </div>
                <p className={styles.postContent}>{item.content}</p>
                <div className={styles.postInfo}>
                  <span className={styles.postDate}>{item.createdAt}</span>
                  <div className={styles.postStats}>
                    <span className={styles.statItem}>👁 {item.viewCount}</span>
                    <span
                      className={`${styles.statItem} ${heartStyles.heartWrapper}`}
                      onClick={(e) => {
                        e.stopPropagation(); // 상세보기 클릭 방지
                        toggleLike(item.contentId);
                      }}
                    >
                      <span className={heartStyles.heartIcon}>{item.liked ? '❤️' : '🤍'}</span>
                      <span className={heartStyles.likeNumber}>{item.likeCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                이전
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
};

export default MyLikes;
