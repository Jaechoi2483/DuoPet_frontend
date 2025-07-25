// src/pages/mypage/components/activity/MyBookmarkedPosts.js

import React, { useEffect, useState, useContext } from 'react';
import styles from './MyPosts.module.css';
import bookmarkStyles from './BookmarkIcon.module.css';
import { AuthContext } from '../../../../AuthProvider';
import apiClient from '../../../../utils/axios';

const MyBookmarks = () => {
  const { userNo } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!userNo) return;
    apiClient
      .get('/mypage/bookmarks', { params: { userId: userNo } })
      .then((res) => {
        const data = res.data || [];
        console.log('🔖 북마크한 게시글 응답:', data);
        setBookmarks(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      })
      .catch((err) => console.error('북마크한 게시글 불러오기 실패:', err));
  }, [userNo]);

  const toggleBookmark = async (contentId) => {
    try {
      const res = await apiClient.post(`/mypage/bookmark/${contentId}`, null, {
        headers: { userid: userNo },
      });

      const updated = bookmarks.filter((item) => (res.data.bookmarked ? true : item.contentId !== contentId));
      setBookmarks(updated);

      setToastMessage(res.data.bookmarked ? '게시글을 북마크했습니다.' : '게시글 북마크를 취소했습니다.');
      setTimeout(() => setToastMessage(''), 2000);
    } catch (err) {
      console.error('북마크 처리 실패:', err);
    }
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
        return type || '기타';
    }
  };

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return bookmarks.slice(start, end);
  };

  return (
    <div className={styles.myPostsContainer}>
      {bookmarks.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>북마크한 게시글이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className={styles.postList}>
            {getCurrentPageItems().map((item) => (
              <div key={item.contentId} className={styles.postItem}>
                <div className={styles.postHeader}>
                  <span className={styles.boardType}>[{getBoardTypeLabel(item.category)}]</span>
                  <h3 className={styles.postTitle}>{item.title}</h3>
                </div>
                <p className={styles.postContent}>{item.content}</p>
                <div className={styles.postInfo}>
                  <span className={styles.postDate}>{item.createdAt}</span>
                  <div className={styles.postStats}>
                    <span className={styles.statItem}>👁 {item.viewCount}</span>
                    <span className={styles.statItem}>❤️ {item.likeCount}</span>
                    <span
                      className={`${bookmarkStyles.bookmarkIcon} ${
                        item.bookmarked ? bookmarkStyles.bookmarkActive : bookmarkStyles.bookmarkInactive
                      }`}
                      onClick={() => toggleBookmark(item.contentId)}
                    >
                      📌
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

export default MyBookmarks;
