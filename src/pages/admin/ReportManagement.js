import React, { useState, useEffect, useCallback } from 'react';
import styles from './ReportManagement.module.css';
import apiClient from '../../utils/axios';
import Modal from '../../components/common/Modal';

// 탭 구성: PENDING, REVIEWED, BLOCKED 세 상태만 관리
const STATUS_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'PENDING', label: '처리대기' },
  { key: 'REVIEWED', label: '보류' },
  { key: 'BLOCKED', label: '차단완료' },
];

// suspendedUntil 배열을 Date 객체로 변환하는 헬퍼 함수
const createDateFromSuspendedUntil = (suspendedUntilArray) => {
  if (!Array.isArray(suspendedUntilArray) || suspendedUntilArray.length < 6) {
    return null;
  }
  const [year, month, day, hour, minute, second, nano] = suspendedUntilArray;
  const milliseconds = nano ? Math.floor(nano / 1_000_000) : 0;
  const date = new Date(year, month - 1, day, hour, minute, second, milliseconds);
  return isNaN(date.getTime()) ? null : date;
};

// 누적 신고 수에 따른 CSS 클래스를 반환하는 헬퍼 함수
const getReportCountClass = (count) => {
  if (!count || count <= 1) return styles.lowCount;
  if (count <= 3) return styles.mediumCount;
  if (count <= 5) return styles.highCount;
  return styles.criticalCount;
};

function ReportManagement() {
  const [activeStatusKey, setActiveStatusKey] = useState('ALL');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  const fetchAndMergeReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsResponse, cumulativeResponse] = await Promise.all([
        apiClient.get('/admin/reports'),
        apiClient.get('/admin/users/report-counts'),
      ]);

      const individualReports = reportsResponse.data || [];
      const cumulativeData = cumulativeResponse.data || [];

      const cumulativeMap = new Map();
      cumulativeData.forEach((item) => {
        if (item.username) {
          cumulativeMap.set(item.username, item.cumulativeReportCount);
        }
      });

      const mergedReports = individualReports.map((report) => ({
        ...report,
        accumulatedReports: cumulativeMap.get(report.targetLoginId) || 1,
      }));

      setReports(mergedReports);
    } catch (err) {
      setError('신고 목록을 불러오지 못했습니다.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndMergeReports();
  }, [fetchAndMergeReports]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    if (!window.confirm(`이 작업은 되돌릴 수 없습니다. 정말 실행하시겠습니까?`)) {
      return;
    }
    try {
      await apiClient.put(`/admin/reports/${reportId}/status`, { status: newStatus });
      fetchAndMergeReports();
    } catch (err) {
      alert('작업에 실패했습니다.');
      console.error(err);
    }
  };

  const handleUnblock = async (reportId) => {
    if (!window.confirm(`사용자의 정지를 해제하시겠습니까?`)) {
      return;
    }
    try {
      await apiClient.put(`/admin/reports/${reportId}/unblock`);
      fetchAndMergeReports();
    } catch (err) {
      alert('정지 해제에 실패했습니다.');
      console.error(err);
    }
  };

  const getAccumulatedBlockPeriod = (accumulatedReports) => {
    if (!accumulatedReports || accumulatedReports <= 1) return 'BLOCK_3DAYS';
    if (accumulatedReports <= 3) return 'BLOCK_7DAYS';
    if (accumulatedReports <= 5) return 'BLOCK_1MONTH';
    return 'BLOCK_PERMANENT';
  };

  const handleRowClick = async (report) => {
    if (report.targetLoginId === '알 수 없음') {
      alert('이미 삭제된 컨텐츠입니다.');
      return;
    }
    setPostLoading(true);
    setIsPostModalOpen(true);
    try {
      const res = await apiClient.get(`/board/detail/${report.targetId}`);
      setSelectedPost(res.data);
    } catch (err) {
      setSelectedPost({ error: '게시글 정보를 불러오지 못했습니다.' });
    } finally {
      setPostLoading(false);
    }
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  const filteredReports = activeStatusKey === 'ALL' ? reports : reports.filter((r) => r.status === activeStatusKey);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>신고관리</h2>
      <div className={styles.filterTabBar}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={
              tab.key === activeStatusKey ? `${styles.filterTabButton} ${styles.active}` : styles.filterTabButton
            }
            onClick={() => setActiveStatusKey(tab.key)}
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
              <th>신고자 ID</th>
              <th>신고대상 ID</th>
              <th>누적신고</th>
              <th>신고내용</th>
              <th>신고사유</th>
              <th>신고일</th>
              <th>관리</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const isContentDeleted = report.targetLoginId === '알 수 없음';

                return (
                  <tr
                    key={report.reportId}
                    onClick={() => handleRowClick(report)}
                    style={{ cursor: isContentDeleted ? 'default' : 'pointer' }}
                  >
                    <td>{report.reportId}</td>
                    <td>{report.targetType}</td>
                    <td>{report.userLoginId}</td>
                    <td>
                      {isContentDeleted ? (
                        <span className={styles.deletedText}>삭제된 대상</span>
                      ) : (
                        report.targetLoginId
                      )}
                    </td>
                    <td className={styles.accumulatedReports}>
                      <span className={`${styles.reportCount} ${getReportCountClass(report.accumulatedReports)}`}>
                        {report.accumulatedReports}회
                      </span>
                    </td>
                    <td title={report.details}>{report.reason}</td>
                    <td>{report.details || '-'}</td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                      {report.status === 'PENDING' ? (
                        <select
                          className={styles.actionDropdown}
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              if (e.target.value === 'BLOCK_ACCUMULATED') {
                                const blockPeriod = getAccumulatedBlockPeriod(report.accumulatedReports);
                                handleUpdateStatus(report.reportId, blockPeriod);
                              } else {
                                handleUpdateStatus(report.reportId, e.target.value);
                              }
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="" disabled>
                            처리 선택
                          </option>
                          <option value="REVIEWED">보류</option>
                          <option value="BLOCK_3DAYS">3일 정지</option>
                          <option value="BLOCK_7DAYS">7일 정지</option>
                          <option value="BLOCK_1MONTH">1개월 정지</option>
                          <option value="BLOCK_PERMANENT">영구 정지</option>
                          <option value="BLOCK_ACCUMULATED">누적 신고 기준 정지</option>
                        </select>
                      ) : report.status === 'BLOCKED' ? (
                        (() => {
                          const suspensionDate = createDateFromSuspendedUntil(report.suspendedUntil);
                          return (
                            <div>
                              {suspensionDate ? (
                                <div>
                                  <span className={styles.blockedText}>
                                    해제: {suspensionDate.toLocaleDateString('ko-KR')}
                                  </span>
                                  <button
                                    onClick={() => handleUnblock(report.reportId)}
                                    className={`${styles.actionButton} ${styles.unblockButton}`}
                                    style={{ marginTop: '4px' }}
                                  >
                                    정지 해제
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <span className={styles.blockedText}>영구정지</span>
                                  <button
                                    onClick={() => handleUnblock(report.reportId)}
                                    className={`${styles.actionButton} ${styles.unblockButton}`}
                                    style={{ marginTop: '4px' }}
                                  >
                                    정지 해제
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <span>보류</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {isContentDeleted ? (
                        <span className={styles.deletedText}>삭제완료</span>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(report.reportId, 'DELETED')}
                          className={`${styles.actionButton} ${styles.dangerButton}`}
                        >
                          삭제
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className={styles.noData}>
                  신고 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <Modal isOpen={isPostModalOpen} onClose={handleClosePostModal}>
        {postLoading ? (
          <div>로딩 중...</div>
        ) : selectedPost ? (
          selectedPost.error ? (
            <div>{selectedPost.error}</div>
          ) : (
            <div>
              <h2>{selectedPost.title}</h2>
              <div>작성자: {selectedPost.userId}</div>
              <div>작성일: {new Date(selectedPost.createdAt).toLocaleDateString()}</div>
              <div style={{ marginTop: 16 }}>{selectedPost.contentBody}</div>
              {Array.isArray(selectedPost.comments) && selectedPost.comments.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3>댓글</h3>
                  <ul style={{ paddingLeft: 0 }}>
                    {selectedPost.comments.map((comment) => (
                      <li
                        key={comment.commentId}
                        style={{
                          marginBottom: 12,
                          listStyle: 'none',
                          borderBottom: '1px solid #eee',
                          paddingBottom: 8,
                        }}
                      >
                        <div style={{ fontWeight: 'bold' }}>{comment.userId}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                        <div>{comment.content}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        ) : null}
      </Modal>
    </div>
  );
}

export default ReportManagement;
