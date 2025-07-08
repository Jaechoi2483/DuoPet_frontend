import React, { useState, useEffect } from 'react';
import styles from './ReportManagement.module.css';
import apiClient from '../../utils/axios';

const STATUS_TABS = [
  { label: '전체' },
  { label: '처리대기' },
  { label: '처리완료' },
];

function ReportManagement() {
  const [activeStatus, setActiveStatus] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        // 실제 API 경로에 맞게 수정 필요
        const response = await apiClient.get('/api/reports');
        setReports(response.data || []);
      } catch (err) {
        setError('신고 목록을 불러오지 못했습니다.');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // 필터링
  const filteredReports =
    activeStatus === 0
      ? reports
      : reports.filter((r) => r.status === STATUS_TABS[activeStatus].label);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>신고관리</h2>
      {/* 상태 탭 */}
      <div className={styles.filterTabBar}>
        {STATUS_TABS.map((tab, idx) => (
          <button
            key={tab.label}
            className={
              idx === activeStatus
                ? `${styles.filterTabButton} ${styles.active}`
                : styles.filterTabButton
            }
            onClick={() => setActiveStatus(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>로딩 중...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'red' }}>{error}</div>
      ) : (
        <table className={styles.reportTable}>
          <thead className={styles.tableHeader}>
            <tr>
              <th>신고번호</th>
              <th>신고유형</th>
              <th>신고자</th>
              <th>신고대상</th>
              <th>내용</th>
              <th>상태</th>
              <th>신고일</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.type}</td>
                  <td>{report.reporter}</td>
                  <td>{report.target}</td>
                  <td>{report.reason}</td>
                  <td>{report.status}</td>
                  <td>{report.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.noData}>
                  신고 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReportManagement; 