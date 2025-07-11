// src/components/common/PagingView.js
import React from 'react';
import styles from './pagingView.module.css';

const PagingView = ({
  currentPage,
  totalPage,
  startPage,
  endPage,
  onPageChange,
}) => {
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className={styles.pagingContainer}>
      {/* 첫 페이지로 이동 */}
      <button disabled={currentPage === 1} onClick={() => onPageChange(1)}>
        〈
      </button>

      {/* 이전 그룹으로 이동 */}
      <button
        disabled={startPage === 1}
        onClick={() => onPageChange(startPage - 1)}
      >
        〈〈
      </button>

      {/* 페이지 숫자들 */}
      {pages.map((page) => (
        <button
          key={page}
          className={currentPage === page ? styles.activePage : ''}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {/* 다음 그룹으로 이동 */}
      <button
        disabled={endPage === totalPage}
        onClick={() => onPageChange(endPage + 1)}
      >
        〉〉
      </button>

      {/* 마지막 페이지로 이동 */}
      <button
        disabled={currentPage === totalPage}
        onClick={() => onPageChange(totalPage)}
      >
        〉
      </button>
    </div>
  );
};

export default PagingView;
