import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider';

import styles from './NoticeList.module.css';

function NoticeList() {
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
        console.error(
          '공지사항 목록을 불러오는 중 오류가 발생했습니다.',
          error
        );
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공지사항</h2>

      <div className={styles.topBar}>
        <div className={styles.searchSection}>
          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="제목 또는 내용 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className={styles.searchButton} type="submit">
              검색
            </button>
          </form>
        </div>
        <button
          className={styles.writeButton}
          onClick={() => navigate('/notice/write')}
        >
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
                  onClick={() => navigate(`/notice/${notice.contentId}`)}
                >
                  {notice.title}
                </td>
                <td>{notice.userId}</td>
                <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                <td>
                  {notice.viewCount !== undefined ? notice.viewCount : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <button
          className={styles.pageButton}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          이전
        </button>
        <span className={styles.pageInfo}>
          {currentPage + 1} / {pageInfo.totalPages}
        </span>
        <button
          className={styles.pageButton}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= pageInfo.totalPages - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default NoticeList;
