import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import styles from './Qna.module.css';
import { useNavigate } from 'react-router-dom';
// --- 1. PagingView 컴포넌트 import ---
import PagingView from '../../components/common/pagingView';

const FILTER_TABS = [
  { label: '전체', status: null },
  { label: '답변완료', status: 'ANSWERED' },
  { label: '답변대기', status: 'PENDING' },
];

function Qna() {
  const [qnaList, setQnaList] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, number: 0 });
  const [currentPage, setCurrentPage] = useState(0); // 0-based index
  const [activeFilter, setActiveFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQnaData = async () => {
      setLoading(true);
      setError(null);
      const status = FILTER_TABS[activeFilter].status;
      try {
        const params = { page: currentPage, size: 10, sort: 'createdAt,desc' };
        if (status) params.status = status;
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
    setCurrentPage(0);
  };

  // --- 2. PagingView에서 받은 페이지 번호(1-based)를 state index(0-based)로 변환 ---
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
  };

  const handleWriteClick = () => {
    navigate('/admin/qna/write');
  };

  const handleQnaClick = (qnaId) => {
    navigate(`/admin/qna/${qnaId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ANSWERED':
        return '답변완료';
      case 'PENDING':
        return '답변대기';
      default:
        return '대기중';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ANSWERED':
        return styles.statusAnswered;
      case 'PENDING':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  if (error)
    return (
      <div className={styles.container}>
        데이터 조회 중 오류가 발생했습니다.
      </div>
    );

  // --- 3. PagingView에 필요한 props 계산 ---
  const pageBlockSize = 10; // 한 번에 보여줄 페이지 번호 개수
  const totalPage = pageInfo.totalPages;
  const currentBlock = Math.floor(currentPage / pageBlockSize);
  const startPage = currentBlock * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPage);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Q&A</h2>

      {/* 필터 및 글쓰기 버튼 UI */}
      <div className={styles.topBar}>
        <div className={styles.filterTabBar}>
          {FILTER_TABS.map((tab, idx) => (
            <button
              key={idx}
              className={`${styles.filterTabButton} ${activeFilter === idx ? styles.active : ''}`}
              onClick={() => handleFilterClick(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className={styles.writeButton} onClick={handleWriteClick}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          글쓰기
        </button>
      </div>

      {/* Q&A 테이블 UI */}
      <table className={styles.qnaTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {loading ? (
            <tr>
              <td colSpan="4" className={styles.noData}>
                로딩 중...
              </td>
            </tr>
          ) : qnaList.length === 0 ? (
            <tr>
              <td colSpan="4" className={styles.noData}>
                등록된 문의글이 없습니다.
              </td>
            </tr>
          ) : (
            qnaList.map((qna, index) => (
              <tr key={qna.contentId} onClick={() => handleQnaClick(qna.contentId)} style={{ cursor: 'pointer' }}>
                <td>{pageInfo.totalElements - (currentPage * 10 + index)}</td>
                <td>{qna.title}</td>
                <td>{formatDate(qna.createdAt)}</td>
                <td>
                  <span className={getStatusClass(qna.status)}>
                    {getStatusText(qna.status)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* --- 4. 기존 페이지네이션을 PagingView 컴포넌트로 교체 --- */}
      {totalPage > 1 && (
        <PagingView
          currentPage={currentPage + 1} // PagingView는 1-based page를 사용
          totalPage={totalPage}
          startPage={startPage}
          endPage={endPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default Qna;
