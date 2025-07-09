import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NoticeList.module.css';

function NoticeList() {
  // 더미 데이터
  const dummyNotices = [
    {
      contentId: 1,
      title: '첫 번째 공지사항',
      userId: 'admin',
      createdAt: '2024-06-01',
    },
    {
      contentId: 2,
      title: '두 번째 공지사항',
      userId: 'manager',
      createdAt: '2024-06-02',
    },
  ];

  const [notices] = useState(dummyNotices); // 실제로는 API로 받아옴
  const [pageInfo] = useState({ totalPages: 1, number: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공지사항</h2>
      <div className={styles.searchSection}>{/* ... */}</div>
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
                  onClick={() => navigate(`/notice/${notice.contentId}`)}
                >
                  {notice.title}
                </td>
                <td>{notice.userId}</td>
                <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
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
