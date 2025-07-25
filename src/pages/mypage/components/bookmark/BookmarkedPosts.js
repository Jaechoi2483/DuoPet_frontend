import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BookmarkedPosts.module.css';

const BookmarkedPosts = () => {
  const navigate = useNavigate();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockBookmarks = [
      {
        id: 101,
        boardType: 'free',
        title: '강아지 산책 팁 10가지',
        author: '멍멍이맘',
        content: '오늘은 강아지 산책할 때 유용한 팁들을 공유하려고 합니다...',
        createdAt: '2024-06-19',
        viewCount: 342,
        commentCount: 15,
        likeCount: 45,
        bookmarkedAt: '2024-06-20'
      },
      {
        id: 102,
        boardType: 'qna',
        title: '고양이 화장실 훈련 방법',
        author: '냥집사',
        content: '새끼 고양이 화장실 훈련은 어떻게 시작하나요?',
        createdAt: '2024-06-17',
        viewCount: 189,
        commentCount: 8,
        likeCount: 12,
        bookmarkedAt: '2024-06-18'
      },
      {
        id: 103,
        boardType: 'free',
        title: '우리집 강아지 미용 후기',
        author: '뽀송이',
        content: '오늘 처음으로 애견미용실 다녀왔어요!',
        createdAt: '2024-06-15',
        viewCount: 567,
        commentCount: 23,
        likeCount: 89,
        bookmarkedAt: '2024-06-16'
      }
    ];
    
    setBookmarkedPosts(mockBookmarks);
  }, []);

  const handlePostClick = (post) => {
    if (post.boardType === 'free') {
      navigate(`/community/free-board/${post.id}`);
    } else if (post.boardType === 'qna') {
      navigate(`/community/qna/${post.id}`);
    }
  };

  const handleRemoveBookmark = (e, postId) => {
    e.stopPropagation();
    if (window.confirm('북마크를 취소하시겠습니까?')) {
      // 실제로는 API 호출
      setBookmarkedPosts(bookmarkedPosts.filter(post => post.id !== postId));
    }
  };

  const getBoardTypeLabel = (type) => {
    switch (type) {
      case 'free':
        return '자유게시판';
      case 'qna':
        return 'Q&A';
      default:
        return '기타';
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(bookmarkedPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = bookmarkedPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.bookmarkedPostsContainer}>
      {bookmarkedPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔖</span>
          <p className={styles.emptyMessage}>북마크한 게시글이 없습니다.</p>
          <p className={styles.emptySubMessage}>관심있는 게시글을 북마크해보세요!</p>
        </div>
      ) : (
        <>
          <div className={styles.postGrid}>
            {currentPosts.map(post => (
              <div 
                key={post.id} 
                className={styles.postCard}
                onClick={() => handlePostClick(post)}
              >
                <div className={styles.postCardHeader}>
                  <span className={styles.boardType}>
                    {getBoardTypeLabel(post.boardType)}
                  </span>
                  <button
                    className={styles.bookmarkButton}
                    onClick={(e) => handleRemoveBookmark(e, post.id)}
                  >
                    🔖
                  </button>
                </div>
                
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postContent}>{post.content}</p>
                
                <div className={styles.postMeta}>
                  <span className={styles.author}>{post.author}</span>
                  <span className={styles.date}>{post.createdAt}</span>
                </div>
                
                <div className={styles.postStats}>
                  <span className={styles.stat}>👁 {post.viewCount}</span>
                  <span className={styles.stat}>💬 {post.commentCount}</span>
                  <span className={styles.stat}>❤️ {post.likeCount}</span>
                </div>
                
                <div className={styles.bookmarkDate}>
                  북마크: {post.bookmarkedAt}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage + 1)}
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

export default BookmarkedPosts;