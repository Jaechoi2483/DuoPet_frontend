import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../AuthProvider';
import styles from './MyPosts.module.css';
import apiClient from '../../../../utils/axios';

const MyPosts = () => {
  const navigate = useNavigate();
  const { userNo } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    if (!userNo) return;

    const fetchMyPosts = async () => {
      try {
        const res = await apiClient.get('/mypage/posts', {
          params: { userId: userNo },
        });

        const data = res.data || [];
        console.log('실제 응답 데이터:', res.data);

        setPosts(data);
        setTotalPages(Math.ceil(data.length / postsPerPage));
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
      }
    };

    fetchMyPosts();
  }, [userNo]);

  const handlePostClick = (post) => {
    navigate(`/community/freeBoard/${post.id}`); //나중에 커뮤니티 다 완성하면 그때 추가
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const getCurrentPagePosts = () => {
    if (!Array.isArray(posts)) return [];

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
            {getCurrentPagePosts().map((post) => (
              <div key={post.id} className={styles.postItem} onClick={() => handlePostClick(post)}>
                <div className={styles.postHeader}>
                  <span className={styles.boardType}>[{getBoardTypeLabel(post.boardType)}]</span>
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
