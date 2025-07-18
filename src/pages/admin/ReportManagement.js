import React, { useState, useEffect, useCallback } from 'react';
import styles from './ReportManagement.module.css';
import apiClient from '../../utils/axios';
import FreeBoardDetail from '../community/freeBoard/FreeBoardDetail';
import Modal from '../../components/common/Modal';

// [수정] 백엔드 상태값(key)과 화면 표시값(label)을 함께 관리
const STATUS_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'PENDING', label: '처리대기' },
  { key: 'REVIEWED', label: '보류' },
  { key: 'BLOCKED', label: '차단완료' },
];

function ReportManagement() {
  const [activeStatusKey, setActiveStatusKey] = useState('ALL');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  // [수정] useCallback으로 함수 재생성 방지
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // [수정] 실제 API 경로로 변경
      const response = await apiClient.get('/admin/reports');
      // 백엔드 응답 구조에 맞게 데이터 설정
      setReports(response.data || []);
    } catch (err) {
      setError('신고 목록을 불러오지 못했습니다.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // [신규] 신고 상태를 변경하는 핸들러 함수
  const handleUpdateStatus = async (reportId, newStatus) => {
    if (!window.confirm(`신고 번호 ${reportId}의 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
      return;
    }
    try {
      await apiClient.put(`/admin/reports/${reportId}/status`, { status: newStatus });
      // 상태 변경 성공 시, 화면 데이터를 다시 불러와 갱신
      fetchReports();
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error(err);
    }
  };

  const handleRowClick = async (report) => {
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

  // [수정] 백엔드 상태값(key) 기준으로 필터링
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
              <th>신고내용</th>
              <th>신고사유</th>
              <th>신고일</th>
              <th>관리</th>
              <th>삭제</th> {/* 삭제 컬럼 추가 */}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.reportId} onClick={() => handleRowClick(report)} style={{ cursor: 'pointer' }}>
                  <td>{report.reportId}</td>
                  <td>{report.targetType}</td>
                  <td>{report.userLoginId}</td>
                  <td>{report.targetLoginId}</td>
                  <td title={report.details}>{report.reason}</td>
                  <td>{report.details || '-'}</td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className={styles.actionsCell} onClick={e => e.stopPropagation()}>
                    {/* 1. '처리대기' 상태일 때만 select 박스 표시 */}
                    {report.status === 'PENDING' ? (
                      <select
                        className={styles.actionDropdown}
                        defaultValue=""
                        onChange={e => {
                          if (e.target.value) handleUpdateStatus(report.reportId, e.target.value);
                          e.target.value = '';
                        }}
                      >
                        <option value="" disabled>처리 선택</option>
                        <option value="REVIEWED">처리 완료 (정지 안함)</option>
                        <option value="BLOCK_3DAYS">3일 정지</option>
                        <option value="BLOCK_7DAYS">7일 정지</option>
                        <option value="BLOCK_1MONTH">1개월 정지</option>
                        <option value="BLOCK_PERMANENT">영구 정지</option>
                      </select>
                    )
                    /* 2. '차단완료' 상태일 때 */
                    : report.status === 'BLOCKED' ? (
                        // 3. 정지 만료일(suspendedUntil) 유무로 임시/영구 정지 구분
                        report.suspendedUntil ? (
                          <span className={styles.blockedText}>
                            해제: {new Date(report.suspendedUntil).toLocaleDateString('ko-KR')}
                          </span>
                        ) : (
                          <span className={styles.blockedText}>영구정지</span>
                        )
                    ) 
                    /* 4. 그 외 상태 (REVIEWED 등) */
                    : (
                      <span>보류</span>
                    )}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdateStatus(report.reportId, 'DELETED')}
                      className={`${styles.actionButton} ${styles.dangerButton}`}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className={styles.noData}>
                  신고 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {/* 게시글 상세 모달 */}
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
              {/* 댓글 표시 */}
              {Array.isArray(selectedPost.comments) && selectedPost.comments.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3>댓글</h3>
                  <ul style={{ paddingLeft: 0 }}>
                    {selectedPost.comments.map((comment) => (
                      <li key={comment.commentId} style={{ marginBottom: 12, listStyle: 'none', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        <div style={{ fontWeight: 'bold' }}>{comment.userId}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{new Date(comment.createdAt).toLocaleDateString()}</div>
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
