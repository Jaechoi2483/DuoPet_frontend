import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/axios'; // API 호출을 위해 apiClient 사용

const RecentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        // 백엔드에 새로 만든 '최신 공지 5개' API를 호출합니다.
        const response = await apiClient.get('/notice/latest');
        setNotices(response.data.content || response.data || []);
      } catch (err) {
        console.error('최신 공지사항 로딩 실패:', err);
        setError('공지사항을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

  // 날짜를 'YYYY. MM. DD.' 형식으로 변환하는 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
  };

  // --- 렌더링 ---
  return (
    <div style={styles.noticeContainer}>
      <div style={styles.header}>
        <h2 style={styles.title}>최신 공지사항</h2>
        <Link to="/notice" style={styles.moreLink}>
          더보기 &gt;
        </Link>
      </div>

      <ul style={styles.noticeList}>
        {loading && <li>로딩 중...</li>}
        {error && <li style={{ color: 'red' }}>{error}</li>}
        {!loading && !error && notices.length === 0 && <li>등록된 공지사항이 없습니다.</li>}
        {!loading &&
          !error &&
          notices.map((notice) => (
            <li key={notice.contentId} style={styles.noticeItem}>
              <Link to={`/notice/${notice.contentId}`} style={styles.noticeTitle}>
                {notice.title}
              </Link>
              <span style={styles.noticeDate}>{formatDate(notice.createdAt)}</span>
            </li>
          ))}
      </ul>
    </div>
  );
};

// --- 스타일 객체 ---
const styles = {
  noticeContainer: {
    maxWidth: '1200px',
    margin: '4rem auto',
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #eee',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    color: '#333',
  },
  moreLink: {
    textDecoration: 'none',
    color: '#888',
    fontSize: '1rem',
    fontWeight: '500',
  },
  noticeList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  noticeItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 0.5rem',
    borderBottom: '1px solid #eee',
  },
  noticeTitle: {
    flexGrow: 1,
    textDecoration: 'none',
    color: '#444',
    fontSize: '1.1rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginRight: '1rem',
  },
  noticeDate: {
    color: '#999',
    flexShrink: 0,
    fontSize: '0.95rem',
  },
};

export default RecentNotices;
