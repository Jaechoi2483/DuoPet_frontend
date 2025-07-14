// src/pages/community/freeBoard/FreeBoardList.js

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import apiClient from '../../../utils/axios'; // axios 인스턴스
import { AuthContext } from '../../../AuthProvider';
import styles from './FreeBoardList.module.css';
import PagingView from '../../../components/common/pagingView';

function FreeBoardList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  const [postList, setPostList] = useState([]);
  const [topLikedPosts, setTopLikedPosts] = useState([]);
  const [topViewedPosts, setTopViewedPosts] = useState([]);
  const [pagingInfo, setPagingInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);

  // 쿼리스트링에서 keyword, sort 읽기
  const keyword = searchParams.get('keyword') || '';
  const sortOption = searchParams.get('sort') || 'title';
  const dateParam = searchParams.get('date') || null;

  const [inputKeyword, setInputKeyword] = useState(keyword); // 입력 필드 전용 상태
  const isKeywordSearch = keyword.trim() !== '';
  const isDateSearch = sortOption === 'date' && dateParam;
  const isSearching = isKeywordSearch || isDateSearch;
  const isDateMode = sortOption === 'date';

  // 페이징 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 검색 입력 변경
  const handleKeywordChange = (e) => {
    setInputKeyword(e.target.value);
  };

  // 검색어 입력
  const handleSearch = () => {
    const query = new URLSearchParams();
    if (inputKeyword.trim()) query.set('keyword', inputKeyword.trim());
    if (sortOption) query.set('sort', sortOption);
    navigate(`/community/freeBoard?${query.toString()}`);
    setCurrentPage(1); // 페이지 초기화
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const query = new URLSearchParams();
    query.set('sort', newSort);

    // 정렬 방식에 따라 입력 초기화
    if (newSort === 'title') {
      setInputKeyword('');
    } else if (newSort === 'date') {
      setSelectedDate(null);
    }

    // URL 이동
    navigate(`/community/freeBoard?${query.toString()}`);
    setCurrentPage(1);
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

  // 날짜 선택
  const handleDateChange = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);

    const query = new URLSearchParams();
    query.set('sort', 'date');
    query.set('date', selected);

    navigate(`/community/freeBoard?${query.toString()}`);
    setCurrentPage(1);
  };

  // 자유게시판 경로 클릭 시 검색 초기화 (현재 페이지에서 다시 눌러도 리셋)
  useEffect(() => {
    if (location.pathname === '/community/freeBoard') {
      setInputKeyword(''); // 검색창 초기화
      setCurrentPage(1);
    }
  }, [location.pathname]);

  // 게시글 목록 불러오기
  useEffect(() => {
    const params = new URLSearchParams();

    params.set('page', currentPage);
    params.set('limit', 2);

    // 제목 정렬 & 키워드 검색
    if (isSearching && keyword.trim()) {
      params.set('keyword', keyword);
      params.set('sort', sortOption);
    }

    // 날짜 정렬 + 날짜 선택 시
    if (sortOption === 'date') {
      params.set('sort', 'date');
      if (selectedDate) {
        params.set('date', selectedDate); // 예: 2025-07-14
      }
    }

    console.log('💡 요청 URL:', `/board/freeList?${params.toString()}`);

    apiClient
      .get(`/board/freeList?${params.toString()}`)
      .then((res) => {
        setPostList(res.data.list);
        setPagingInfo(res.data.paging);
      })
      .catch((err) => console.error('자유게시판 목록 조회 실패:', err));
  }, [keyword, sortOption, currentPage, selectedDate]);

  useEffect(() => {
    if (sortOption === 'date' && dateParam) {
      // 주소에 있는 날짜 반영
      setSelectedDate(dateParam);
    }
  }, [sortOption, dateParam]);

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
              <option value="title">제목</option>
              <option value="date">날짜</option>
            </select>

            {sortOption === 'title' ? (
              <>
                <input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  className={styles.searchInput}
                  value={inputKeyword}
                  onChange={handleKeywordChange}
                />
                <button className={styles.searchButton} onClick={handleSearch}>
                  검색
                </button>
              </>
            ) : (
              <input type="date" className={styles.dateInput} value={selectedDate || ''} onChange={handleDateChange} />
            )}
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
