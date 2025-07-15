import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import apiClient from '../../utils/axios';
import PagingView from '../../components/common/pagingView';
import styles from './Qna.module.css';

// 컴포넌트 외부로 분리하여 불필요한 리렌더링 방지
const FILTER_TABS = [
  { label: '전체', status: null },
  { label: '답변완료', status: 'ANSWERED' },
  { label: '답변대기', status: 'PENDING' },
];

function Qna() {
  // --- 상태 관리 (State) ---
  const [qnaList, setQnaList] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, number: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);
  const [dataLoading, setDataLoading] = useState(false); // 데이터 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지 상태

  // --- 컨텍스트 및 훅 ---
  const navigate = useNavigate();
  // AuthContext에서 필요한 값들을 직접 구조 분해하여 가져옵니다.
  const { isLoggedIn, isAuthLoading } = useContext(AuthContext);

  // --- 데이터 조회 로직 (useEffect) ---
  useEffect(() => {
    const fetchQnaData = async () => {
      setDataLoading(true);
      setError(null);
      const status = FILTER_TABS[activeFilter].status;
      try {
        const params = { page: currentPage, size: 10, sort: 'createdAt,desc' };
        if (status) params.status = status;
        const response = await apiClient.get('/qna', { params });
        setQnaList(response.data.content);
        setPageInfo(response.data);
      } catch (err) {
        console.error('Q&A 목록 조회 중 오류 발생:', err);
        if (err.response && err.response.status === 401) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
        } else {
          setError('데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        setDataLoading(false);
      }
    };

    // ✅ 데이터 조회 조건을 명확하게 변경
    // 인증 상태 확인이 완료되었고(isAuthLoading === false),
    // 로그인 상태일 때만(isLoggedIn === true) 데이터를 조회합니다.
    if (!isAuthLoading && isLoggedIn) {
      fetchQnaData();
    }
  }, [currentPage, activeFilter, isLoggedIn, isAuthLoading, navigate]); // 의존성 배열에 상태값 명시

  // --- 이벤트 핸들러 ---
  const handleFilterClick = (idx) => {
    setActiveFilter(idx);
    setCurrentPage(0);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
  };

  const handleWriteClick = () => navigate('/admin/qna/write');
  const handleQnaClick = (qnaId) => navigate(`/admin/qna/${qnaId}`);

  // --- 유틸리티 함수 ---
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const getStatusText = (status) => ({ ANSWERED: '답변완료', PENDING: '답변대기' })[status] || '대기중';
  const getStatusClass = (status) =>
    ({ ANSWERED: styles.statusAnswered, PENDING: styles.statusPending })[status] || styles.statusDefault;

  // --- 렌더링 로직 ---

  // 1. 최초 인증 상태 확인 중일 때의 UI
  if (isAuthLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>페이지를 불러오는 중입니다...</div>
      </div>
    );
  }

  // 2. 비로그인 상태가 확정되었을 때의 UI
  if (isLoggedIn === false) {
    return (
      <div className={styles.container}>
        <div className={styles.loginGuideBox}>
          <div className={styles.loginGuideIcon}>🔒</div>
          <div className={styles.loginGuideTitle}>1:1 문의는 로그인 후 이용 가능합니다</div>
          <div className={styles.loginGuideDesc}>
            문의 내역 확인, 답변 알림 등 다양한 서비스를 이용하려면 로그인이 필요합니다.
          </div>
          <button className={styles.loginGuideButton} onClick={() => navigate('/login')}>
            로그인 하러 가기
          </button>
        </div>
      </div>
    );
  }

  // 3. 로그인 상태에서 보여줄 메인 UI
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Q&A</h2>

      <div className={styles.topBar}>
        <div className={styles.filterTabBar}>
          {FILTER_TABS.map((tab, idx) => (
            <button
              key={idx}
              className={`${styles.filterTabButton} ${activeFilter === idx ? styles.active : ''}`}
              onClick={() => handleFilterClick(idx)}
              disabled={dataLoading} // 데이터 로딩 중에는 버튼 비활성화
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className={styles.writeButton} onClick={handleWriteClick}>
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
          {dataLoading ? (
            <tr>
              <td colSpan="4" className={styles.loadingMessage}>
                데이터를 불러오는 중...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="4" className={styles.errorMessage}>
                {error}
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
              <tr key={qna.contentId} onClick={() => handleQnaClick(qna.contentId)} className={styles.qnaRow}>
                <td>{pageInfo.totalElements - (currentPage * 10 + index)}</td>
                <td>{qna.title}</td>
                <td>{formatDate(qna.createdAt)}</td>
                <td>
                  <span className={getStatusClass(qna.status)}>{getStatusText(qna.status)}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pageInfo.totalPages > 1 && !dataLoading && (
        <PagingView currentPage={pageInfo.number + 1} totalPage={pageInfo.totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

export default Qna;
