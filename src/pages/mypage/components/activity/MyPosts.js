import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyPosts.module.css';

const MyPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        boardType: 'free',
        title: '우리집 강아지가 너무 귀여워요',
        content: '오늘 산책하다가 찍은 사진입니다...',
        createdAt: '2024-06-20',
        viewCount: 45,
        commentCount: 3,
        likeCount: 12
      },
      {
        id: 2,
        boardType: 'free',
        title: '강아지 훈련 팁 공유합니다',
        content: '제가 직접 해본 훈련 방법인데요...',
        createdAt: '2024-06-18',
        viewCount: 128,
        commentCount: 8,
        likeCount: 24
      },
      {
        id: 3,
        boardType: 'qna',
        title: '고양이 사료 추천 부탁드려요',
        content: '5살 된 고양이인데 어떤 사료가 좋을까요?',
        createdAt: '2024-06-15',
        viewCount: 67,
        commentCount: 5,
        likeCount: 3
      },
      {
        id: 4,
        boardType: 'free',
        title: '반려동물과 함께하는 일상',
        content: '매일이 행복해요',
        createdAt: '2024-06-10',
        viewCount: 92,
        commentCount: 4,
        likeCount: 18
      }
    ];
    
    setPosts(mockPosts);
    setTotalPages(Math.ceil(mockPosts.length / postsPerPage));
  }, []);

  const handlePostClick = (post) => {
    if (post.boardType === 'free') {
      navigate(`/community/free-board/${post.id}`);
    } else if (post.boardType === 'qna') {
      navigate(`/community/qna/${post.id}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const getCurrentPagePosts = () => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return posts.slice(startIndex, endIndex);
  };

  return (
    <div className={styles.myPostsContainer}>
      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>작성한 게시글이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className={styles.postList}>
            {getCurrentPagePosts().map(post => (
              <div 
                key={post.id} 
                className={styles.postItem}
                onClick={() => handlePostClick(post)}
              >
                <div className={styles.postHeader}>
                  <span className={styles.boardType}>
                    [{getBoardTypeLabel(post.boardType)}]
                  </span>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                </div>
                <p className={styles.postContent}>{post.content}</p>
                <div className={styles.postInfo}>
                  <span className={styles.postDate}>{post.createdAt}</span>
                  <div className={styles.postStats}>
                    <span className={styles.statItem}>
                      <span className={styles.statIcon}>👁</span> {post.viewCount}
                    </span>
                    <span className={styles.statItem}>
                      <span className={styles.statIcon}>💬</span> {post.commentCount}
                    </span>
                    <span className={styles.statItem}>
                      <span className={styles.statIcon}>❤️</span> {post.likeCount}
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

export default MyPosts;