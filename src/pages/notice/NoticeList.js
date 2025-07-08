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

  const navigate = useNavigate();

  // 2. API를 호출하여 데이터를 가져오는 로직
  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true); // 데이터 요청 시작 시 로딩 상태로 변경
      try {
        // 백엔드에 현재 페이지, 페이지 크기, 정렬 방식을 파라미터로 전달
        const response = await apiClient.get('/notices', {
          params: {
            page: currentPage,
            size: 10, // 한 페이지에 10개씩
            sort: 'createdAt,desc', // 최신 작성일 순으로 정렬
          },
        });

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
  }, [currentPage]); // currentPage가 변경될 때마다 API를 다시 호출

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공지사항</h2>

      {/* 검색창 (기능은 비활성화 상태) */}
      <div className={styles.searchSection}>{/* ... */}</div>

      {/* 공지사항 테이블 */}
      <table className={styles.noticeTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {/* 3. 받아온 데이터를 화면에 렌더링하는 로직 */}
          {loading ? (
            <tr>
              <td colSpan={4} className={styles.noData}>
                로딩 중...
              </td>
            </tr>
          ) : notices.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.noData}>
                공지사항이 없습니다.
              </td>
            </tr>
          ) : (
            notices.map((notice) => (
              <tr key={notice.contentId}>
                <td>{notice.contentId}</td>
                <td
                  className={styles.noticeTitle}
                  onClick={() => navigate(`/notice/${notice.contentId}`)} // 제목 클릭 시 상세 페이지로 이동
                >
                  {notice.title}
                </td>
                <td>{notice.userId}</td>{' '}
                <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 4. 페이지네이션 기능 구현 */}
      <div className={styles.pagination}>
        <button
          className={styles.pageButton}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0} // 첫 페이지일 때 '이전' 비활성화
        >
          이전
        </button>
        <span className={styles.pageInfo}>
          {currentPage + 1} / {pageInfo.totalPages}
        </span>
        <button
          className={styles.pageButton}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= pageInfo.totalPages - 1} // 마지막 페이지일 때 '다음' 비활성화
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default NoticeList;
