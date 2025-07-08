import React, { useState } from 'react';
import styles from './Qna.module.css';

const FILTER_TABS = [
  { label: '전체' },
  { label: '답변완료' },
  { label: '답변대기' },
];

function Qna() {
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Q&amp;A</h2>

      {/* 필터 탭 + 검색창 한 줄 배치 */}
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
              onClick={() => setActiveFilter(idx)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className={styles.searchInput}
            disabled
          />
          <button className={styles.searchButton} disabled>
            검색
          </button>
        </div>
      </div>

      {/* QnA 테이블 */}
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
          <tr>
            <td colSpan={5} className={styles.noData}>
              문의 내역이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      {/* 페이지네이션 (기능 없음) */}
      <div className={styles.pagination}>
        <button className={styles.pageButton} disabled>
          이전
        </button>
        <button className={`${styles.pageButton} ${styles.active}`} disabled>
          1
        </button>
        <button className={styles.pageButton} disabled>
          다음
        </button>
      </div>
    </div>
  );
}

export default Qna;
