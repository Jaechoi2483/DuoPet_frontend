import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider';
import PagingView from '../../components/common/pagingView';

import styles from './NoticeList.module.css';

const formatDate = (dateString) => {
  // 1. 날짜 데이터가 없는 경우 처리
  if (!dateString) {
    return '날짜 없음';
  }
  // 2. Date 객체로 변환
  const date = new Date(dateString);

  // 3. 유효하지 않은 날짜인 경우 처리 (Invalid Date 방지)
  if (isNaN(date.getTime())) {
    return '날짜 형식 오류';
  }

  // 4. 'YYYY. MM. DD.' 형식으로 변환하여 반환
  return date.toLocaleDateString('ko-KR');
};

function NoticeList({ onNoticeClick }) {
  // 1. 데이터를 관리할 state 변수들
  const [notices, setNotices] = useState([]); // 게시물 목록
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, number: 0 }); // 페이징 정보
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  // 2. API를 호출하여 데이터를 가져오는 로직
  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true); // 데이터 요청 시작 시 로딩 상태로 변경
      try {
        const params = {
          page: currentPage,
          size: 10,
          sort: 'createdAt,desc',
        };
        if (search) {
          params.keyword = search;
        }
        // 백엔드에 현재 페이지, 페이지 크기, 정렬 방식을 파라미터로 전달
        const response = await apiClient.get('/notice', { params });

        // 응답 받은 데이터로 state 업데이트
        setNotices(response.data.content); // 실제 목록 데이터
        setPageInfo({
          // 페이징 관련 정보
          totalPages: response.data.totalPages,
          number: response.data.number,
        });
      } catch (error) {
        console.error('공지사항 목록을 불러오는 중 오류가 발생했습니다.', error);
      } finally {
        setLoading(false); // 데이터 요청 완료 후 로딩 상태 해제
      }
    };

    fetchNotices();
  }, [currentPage, search]); // currentPage가 변경될 때마다 API를 다시 호출

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setCurrentPage(0);
  };
  const handleClearSearch = () => {
    setSearch('');
    setSearchInput('');
    setCurrentPage(0);
  };

  // PagingView용 페이지 계산
  const pageBlockSize = 10;
  const totalPage = pageInfo.totalPages;
  const currentBlock = Math.floor(currentPage / pageBlockSize);
  const startPage = currentBlock * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPage);

  // PagingView에서 받은 pageNumber(1-based)를 state index(0-based)로 변환
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공지사항</h2>

      <div className={styles.topBar}>
        <div className={styles.searchSection}>
          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="제목 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className={styles.searchButton} type="submit" aria-label="검색">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" />
                <line x1="14.2" y1="14.2" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </div>
        <button className={styles.writeButton} onClick={() => navigate('/notice/write')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          글쓰기
        </button>
      </div>

      {/* 공지사항 테이블 */}

      <table className={styles.noticeTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {loading ? (
            <tr>
              <td colSpan={5} className={styles.noData}>
                로딩 중...
              </td>
            </tr>
          ) : notices.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.noData}>
                공지사항이 없습니다.
              </td>
            </tr>
          ) : (
            notices.map((notice) => (
              <tr key={notice.contentId}>
                <td>{notice.contentId}</td>
                <td
                  className={styles.noticeTitle}
                  onClick={() => {
                    if (onNoticeClick) {
                      onNoticeClick(notice.contentId);
                    } else {
                      navigate(`/notice/${notice.contentId}`);
                    }
                  }}
                >
                  {notice.title}
                </td>
                <td>{notice.userId}</td>
                <td>{formatDate(notice.createdAt)}</td>
                <td>{notice.viewCount !== undefined ? notice.viewCount : '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* PagingView 컴포넌트로 교체 */}
      {totalPage > 1 && (
        <PagingView
          currentPage={currentPage + 1}
          totalPage={totalPage}
          startPage={startPage}
          endPage={endPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default NoticeList;
