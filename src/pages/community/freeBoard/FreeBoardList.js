// src/pages/community/freeBoard/FreeBoardList.js

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../../utils/axios'; // axios 인스턴스
import { AuthContext } from '../../../AuthProvider';
import styles from './FreeBoardList.module.css';
import PagingView from '../../../components/common/pagingView';

function FreeBoardList() {
  const navigate = useNavigate();
  const [postList, setPostList] = useState([]);
  const [topLikedPosts, setTopLikedPosts] = useState([]);
  const [topViewedPosts, setTopViewedPosts] = useState([]);
  const [pagingInfo, setPagingInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoggedIn } = useContext(AuthContext);
  const [keyword, setKeyword] = useState('');
  const [sortOption, setSortOption] = useState('date');
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const handleKeywordChange = (e) => {
    const input = e.target.value;
    setKeyword(input);
  };

  const handleSearch = () => {
    if (keyword.trim() === '') {
      setIsSearching(false); // 검색어 없으면 전체 보기
    } else {
      setIsSearching(true); // 검색 중 상태
    }
    setCurrentPage(1);

    apiClient.get(`/board/freeList?page=1&limit=2&keyword=${keyword}&sort=${sortOption}`).then((res) => {
      setPostList(res.data.list);
      setPagingInfo(res.data.paging);
    });
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    navigate('/community/freeBoard/write');
  };

  const handleClick = (id) => {
    navigate(`/community/freeBoard/${id}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === 'true') {
      setKeyword('');
      setIsSearching(false);
      setCurrentPage(1);
    }
  }, [location]);

  // 자유게시판 목록 + 페이징
  useEffect(() => {
    apiClient
      .get(`/board/freeList?page=${currentPage}&limit=2&keyword=${isSearching ? keyword : ''}&sort=${sortOption}`)
      .then((res) => {
        setPostList(res.data.list);
        setPagingInfo(res.data.paging);
      })
      .catch((err) => console.error('자유게시판 목록 조회 실패:', err));
  }, [currentPage, sortOption, isSearching]);

  // 좋아요/조회수 TOP3 (처음에만)
  useEffect(() => {
    apiClient
      .get('/board/top-liked')
      .then((res) => {
        setTopLikedPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error('TOP 좋아요 게시글 조회 실패:', err));

    apiClient
      .get('/board/top-viewed')
      .then((res) => {
        setTopViewedPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error('TOP 조회수 게시글 조회 실패:', err));
  }, []);

  return (
    <div className={styles.container}>
      {/* 상단 제목 + 검색/정렬/글쓰기 */}
      <div className={styles.listHeader}>
        <h2 className={styles.title}>커뮤니티 &gt; 자유게시판</h2>

        <div className={styles.listControls}>
          <div className={styles.searchSortBox}>
            <select className={styles.selectBox} value={sortOption} onChange={handleSortChange}>
              <option value="title">제목순</option>
              <option value="date">날짜순</option>
            </select>

            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className={styles.searchInput}
              value={keyword}
              onChange={handleKeywordChange}
            />
            <button className={styles.searchButton} onClick={handleSearch}>
              검색
            </button>
          </div>

          <button className={styles.writeButton} onClick={handleWriteClick}>
            글쓰기
          </button>
        </div>
      </div>

      {/* 추천 게시물 */}
      {!isSearching && (
        <div className={styles.topSection}>
          <div className={styles.topBox}>
            <h3>🔥 좋아요 많은 글</h3>
            <div className={styles.cardList}>
              {topLikedPosts.map((post) => (
                <div key={post.contentId} className={styles.card} onClick={() => handleClick(post.contentId)}>
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
                <div key={post.contentId} className={styles.card} onClick={() => handleClick(post.contentId)}>
                  <span className={styles.badge}>자유게시판</span>
                  <p className={styles.cardTitle}>{post.title}</p>
                  <p className={styles.cardStats}>👁 {post.viewCount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 전체 게시글 리스트 */}
      <div className={styles.postList}>
        {postList.map((post) => (
          <div key={post.contentId} className={styles.postItem} onClick={() => handleClick(post.contentId)}>
            <div className={styles.postTitle}>
              <span className={styles.badge}>자유게시판</span>
              <span>{post.title}</span>
            </div>
            <div className={styles.postMeta}>
              <span>작성자ID: {post.userId}</span> |<span>{new Date(post.createdAt).toLocaleDateString()}</span> |
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
