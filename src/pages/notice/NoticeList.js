import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider';
import PagingView from '../../components/common/pagingView';

import styles from './NoticeList.module.css';

const formatDate = (dateString) => {
  if (!dateString) {
    return '날짜 없음';
  }
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '날짜 형식 오류';
  }

  return date.toLocaleDateString('ko-KR');
};

function NoticeList({ onNoticeClick }) {
  const [notices, setNotices] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, number: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, isAuthLoading, role } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          size: 10,
          sort: 'createdAt,desc',
        };
        if (search) {
          params.keyword = search;
        }
        const response = await apiClient.get('/notice', { params });

        setNotices(response.data.content);
        setPageInfo({
          totalPages: response.data.totalPages,
          number: response.data.number,
        });
      } catch (error) {
        console.error('공지사항 목록을 불러오는 중 오류가 발생했습니다.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [currentPage, search]);

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

  const pageBlockSize = 10;
  const totalPage = pageInfo.totalPages;
  const currentBlock = Math.floor(currentPage / pageBlockSize);
  const startPage = currentBlock * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPage);

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
        {role === 'admin' && (
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
        )}
      </div>

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
