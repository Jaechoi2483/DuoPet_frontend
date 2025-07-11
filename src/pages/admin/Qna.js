import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import styles from './Qna.module.css';
import { useNavigate } from 'react-router-dom';

const FILTER_TABS = [
  { label: '전체', status: null },
  { label: '답변완료', status: 'ANSWERED' },
  { label: '답변대기', status: 'PENDING' },
];

function Qna() {
  const [qnaList, setQnaList] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, number: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const qnaPerPage = 10;
  const totalPages = Math.ceil(qnaList.length / qnaPerPage);
  const pagedQnaList = qnaList.slice(
    currentPage * qnaPerPage,
    (currentPage + 1) * qnaPerPage
  );
  const [activeFilter, setActiveFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQnaData = async () => {
      setLoading(true);
      setError(null);

      // 현재 활성화된 필터의 status 값을 가져옴
      const status = FILTER_TABS[activeFilter].status;

      try {
        // 백엔드에 보낼 파라미터들
        const params = {
          page: currentPage,
          size: 10,
          sort: 'createdAt,desc',
        };
        // '전체' 탭이 아닐 경우에만 status 파라미터 추가
        if (status) {
          params.status = status;
        }

        const response = await apiClient.get('/qna', { params });

        setQnaList(response.data.content);
        setPageInfo(response.data);
      } catch (err) {
        setError(err);
        console.error('Q&A 목록 조회 중 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQnaData();
  }, [currentPage, activeFilter]);

  const handleFilterClick = (idx) => {
    setActiveFilter(idx);
    setCurrentPage(0); // 필터를 바꾸면 첫 페이지로 이동
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  console.log('API로부터 받아온 Q&A 목록:', qnaList);
  if (error)
    return (
      <div className={styles.container}>
        데이터 조회 중 오류가 발생했습니다.
      </div>
    );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Q&A</h2>

      <div className={styles.topBar}>
        <div className={styles.filterTabBar}>
          {FILTER_TABS.map((tab, idx) => (
            <button
              key={tab.label}
              className={
                idx === activeFilter
                  ? `${styles.filterTabButton} ${styles.active}`
                  : styles.filterTabButton
              }
              onClick={() => handleFilterClick(idx)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          className={styles.writeButton}
          type="button"
          onClick={() => navigate('/admin/qna/write')}
        >
          문의하기
        </button>
      </div>

      <table className={styles.qnaTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>답변상태</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {loading ? (
            <tr>
              <td colSpan={5} className={styles.noData}>
                로딩 중...
              </td>
            </tr>
          ) : pagedQnaList.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.noData}>
                문의 내역이 없습니다.
              </td>
            </tr>
          ) : (
            pagedQnaList.map((item) => (
              <tr key={item.contentId}>
                <td>{item.contentId}</td>
                <td
                  className={styles.qnaTitle}
                  style={{
                    cursor: 'pointer',
                    color: '#1976d2',
                    textDecoration: 'underline',
                  }}
                  onClick={() => navigate(`/admin/qna/${item.contentId}`)}
                >
                  {item.title}
                </td>
                <td>{item.userId}</td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                  <span
                    className={
                      item.status === 'ANSWERED'
                        ? styles.statusAnswered
                        : styles.statusPending
                    }
                  >
                    {item.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {qnaList.length > qnaPerPage && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            이전
          </button>
          <span className={styles.pageInfo}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default Qna;
