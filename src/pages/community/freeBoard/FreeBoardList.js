// src/pages/community/freeBoard/FreeBoardList.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/axios'; // axios 인스턴스
import styles from './FreeBoardList.module.css';
import PagingView from '../../../components/common/pagingView';

function FreeBoardList() {
  const navigate = useNavigate();
  const [postList, setPostList] = useState([]);
  const [topLikedPosts, setTopLikedPosts] = useState([]);
  const [topViewedPosts, setTopViewedPosts] = useState([]);
  const [pagingInfo, setPagingInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    // 전체 게시글
    apiClient
      .get('/board/free')
      .then((res) => {
        console.log('📌 전체 게시글 응답:', res.data);
        setPostList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error('자유게시판 전체 조회 실패:', err));

    // 좋아요 TOP3
    apiClient
      .get('/board/top-liked')
      .then((res) => {
        console.log('🔥 좋아요 TOP3 응답:', res.data);
        setTopLikedPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error('TOP 좋아요 게시글 조회 실패:', err));

    // 조회수 TOP3
    apiClient
      .get('/board/top-viewed')
      .then((res) => {
        console.log('👀 조회수 TOP3 응답:', res.data);
        setTopViewedPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error('TOP 조회수 게시글 조회 실패:', err));
  }, []);

  const handleClick = (id) => {
    navigate(`/community/freeBoard/${id}`);
  };

  // 자유게시판 목록을 페이징 API로 불러옴
  useEffect(() => {
    apiClient
      .get(`/board/freeList?page=${currentPage}&limit=2`)
      .then((res) => {
        setPostList(res.data.list);
        setPagingInfo(res.data.paging);
      })
      .catch((err) => console.error('자유게시판 목록 조회 실패:', err));
  }, [currentPage]);

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
                key={post.contentId}
                className={styles.card}
                onClick={() => handleClick(post.contentId)}
              >
                <span className={styles.badge}>자유게시판</span>
                <p className={styles.cardTitle}>{post.title}</p>
                <p className={styles.cardStats}>❤ {post.likeCount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.topBox}>
          <h3>👁️ 조회수 많은 글</h3>
          <div className={styles.cardList}>
            {topViewedPosts.map((post) => (
              <div
                key={post.contentId}
                className={styles.card}
                onClick={() => handleClick(post.contentId)}
              >
                <span className={styles.badge}>자유게시판</span>
                <p className={styles.cardTitle}>{post.title}</p>
                <p className={styles.cardStats}>👁 {post.viewCount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 전체 게시글 리스트 */}
      <div className={styles.postList}>
        {postList.map((post) => (
          <div
            key={post.contentId}
            className={styles.postItem}
            onClick={() => handleClick(post.contentId)}
          >
            <div className={styles.postTitle}>
              <span className={styles.badge}>자유게시판</span>
              <span>{post.title}</span>
            </div>
            <div className={styles.postMeta}>
              <span>작성자ID: {post.userId}</span> |
              <span>{new Date(post.createdAt).toLocaleDateString()}</span> |
              <span>👁 {post.viewCount}</span>
              <span>❤ {post.likeCount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 페이징 */}
      <PagingView
        currentPage={pagingInfo.currentPage || 1}
        totalPage={pagingInfo.totalPage || 1}
        startPage={pagingInfo.startPage || 1}
        endPage={pagingInfo.endPage || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default FreeBoardList;
