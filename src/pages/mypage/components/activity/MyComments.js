// src/pages/mypage/components/activity/MyComments.js

import React, { useEffect, useState, useContext } from 'react';
import styles from './MyPosts.module.css'; // 공통 CSS
import { AuthContext } from '../../../../AuthProvider';
import apiClient from '../../../../utils/axios';

const MyComments = () => {
  const { userNo } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const commentsPerPage = 10;

  useEffect(() => {
    if (!userNo) return;
    apiClient
      .get('/mypage/comments', { params: { userId: userNo } })
      .then((res) => {
        const data = res.data || [];
        console.log('🔥 댓글 응답:', data);
        setComments(data);
        setTotalPages(Math.ceil(data.length / commentsPerPage));
      })
      .catch((err) => console.error('댓글 불러오기 실패:', err));
  }, [userNo]);

  const getCurrentPageComments = () => {
    const start = (currentPage - 1) * commentsPerPage;
    const end = start + commentsPerPage;
    return comments.slice(start, end);
  };

  const getBoardTypeLabel = (type) => {
    switch (type) {
      case '자유':
        return '자유게시판';
      case '팁':
        return '팁게시판';
      case '후기':
        return '후기게시판';
      case '질문':
        return '질문게시판';
      default:
        return '기타';
    }
  };

  return (
    <div className={styles.myPostsContainer}>
      {comments.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>작성한 댓글이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className={styles.postList}>
            {getCurrentPageComments().map((comment) => (
              <div key={comment.commentId} className={styles.postItem}>
                <div className={styles.postHeader}>
                  <span className={styles.boardType}>[{getBoardTypeLabel(comment.boardType)}]</span>
                  <h3 className={styles.postTitle}>{comment.postTitle}</h3>
                </div>
                <p className={styles.postContent}>
                  <span className={styles.commentLabel}>💬 댓글:</span> {comment.content}
                </p>
                <div className={styles.postInfo}>
                  <span className={styles.postDate}>{comment.createdAtStr}</span>
                  <div className={styles.postStats}>
                    <span className={styles.statItem}>❤️ {comment.likeCount}</span>
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
    </div>
  );
};

export default MyComments;
