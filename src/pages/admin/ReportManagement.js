import React, { useState, useEffect, useCallback, useContext } from 'react';
import styles from './ReportManagement.module.css'; // CSS 모듈 임포트
import Modal from '../../components/common/Modal';
import { AuthContext } from '../../AuthProvider'; // AuthContext 경로 확인
import PagingView from '../../components/common/pagingView';

// 탭 구성: PENDING, REVIEWED, PROCESSED, BLOCKED 상태 관리 (PROCESSED는 블라인드 액션 의미)
const STATUS_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'PENDING', label: '처리대기' },
  { key: 'REVIEWED', label: '보류' },
  { key: 'BLOCKED', label: '차단완료' },
];

// suspendedUntil 배열을 Date 객체로 변환하는 헬퍼 함수
const createDateFromSuspendedUntil = (suspendedUntilArray) => {
  // 데이터가 null이거나 배열이 아니거나, 필요한 날짜 정보가 부족하면 null 반환
  if (!suspendedUntilArray || !Array.isArray(suspendedUntilArray) || suspendedUntilArray.length < 6) {
    return null;
  }

  // 배열에서 년, 월, 일, 시, 분, 초 추출
  // JavaScript의 Date 객체는 월(month)을 0부터 시작(0=1월)하므로, 전달받은 월 값에서 1을 빼주어야 합니다.
  const [year, month, day, hour, minute, second] = suspendedUntilArray;
  return new Date(year, month - 1, day, hour, minute, second);
};

// 누적 신고 수에 따른 CSS 클래스를 반환하는 헬퍼 함수
const getReportCountClass = (count) => {
  if (count <= 1) return styles.lowCount;
  if (count <= 3) return styles.mediumCount;
  if (count <= 5) return styles.highCount;
  return styles.criticalCount;
};

function ReportManagement() {
  const { secureApiRequest } = useContext(AuthContext);

  const [activeStatusKey, setActiveStatusKey] = useState('ALL');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // [추가] 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pagingData, setPagingData] = useState({
    totalPage: 1,
    startPage: 1,
    endPage: 1,
  });
  const PAGE_GROUP_SIZE = 10; // 한 번에 보여줄 페이지 번호 개수

  // 게시글 관련 상태
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null); // 게시글 내 댓글 강조용

  // 댓글 관련 새로운 상태
  const [selectedComment, setSelectedComment] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchAndMergeReports = useCallback(
    async (page, status) => {
      setLoading(true);
      setError(null);
      try {
        // [핵심] URLSearchParams를 사용하여 안전하게 쿼리 스트링을 생성합니다.
        const params = new URLSearchParams();
        params.append('page', page - 1);
        params.append('size', 15);

        if (status !== 'ALL') {
          params.append('status', status);
        }

        // 완성된 URL: /admin/reports?page=0&status=PENDING
        const reportUrl = `/admin/reports?${params.toString()}`;

        // [핵심] 완성된 URL을 secureApiRequest에 직접 전달합니다.
        const reportsResponse = await secureApiRequest(reportUrl, { method: 'GET' });

        const individualReports = reportsResponse.data || [];
        const totalPage = parseInt(reportsResponse.headers['x-total-pages'], 10) || 1;

        const currentGroup = Math.ceil(page / PAGE_GROUP_SIZE);
        const endPage = Math.min(currentGroup * PAGE_GROUP_SIZE, totalPage);
        const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
        setPagingData({ totalPage, startPage, endPage });

        const cumulativeMap = new Map();
        try {
          // 누적 신고 횟수는 파라미터가 없으므로 그대로 호출합니다.
          const cumulativeResponse = await secureApiRequest('/admin/users/report-counts', { method: 'GET' });
          const cumulativeData = cumulativeResponse.data || [];
          cumulativeData.forEach((item) => {
            if (item.username) {
              cumulativeMap.set(item.username, item.cumulativeReportCount);
            }
          });
        } catch (cumulativeError) {
          console.error('누적 신고 횟수를 불러오는 데 실패했습니다:', cumulativeError);
        }

        const mergedReports = individualReports.map((report) => ({
          ...report,
          accumulatedReports: cumulativeMap.get(report.targetLoginId) || 0,
        }));

        setReports(mergedReports);
      } catch (err) {
        setError('신고 목록을 불러오지 못했습니다.');
        setReports([]);
        console.error('Fetch reports error:', err);
      } finally {
        setLoading(false);
      }
    },
    [secureApiRequest] // secureApiRequest에 대한 의존성 복원
  );

  useEffect(() => {
    fetchAndMergeReports(currentPage, activeStatusKey);
  }, [currentPage, activeStatusKey, fetchAndMergeReports]);

  const handleTabClick = (key) => {
    setActiveStatusKey(key);
    setCurrentPage(1);
  };

  // [추가] 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    if (!window.confirm(`이 작업은 되돌릴 수 없습니다. 정말 실행하시겠습니까?`)) {
      return;
    }
    try {
      let finalStatusToSend = newStatus;

      if (newStatus === 'BLOCK_ACCUMULATED') {
        const reportToBlock = reports.find((r) => r.reportId === reportId);
        if (reportToBlock) {
          finalStatusToSend = getAccumulatedBlockPeriod(reportToBlock.accumulatedReports);
        } else {
          alert('신고 정보를 찾을 수 없습니다.');
          return;
        }
      }

      await secureApiRequest(`/admin/reports/${reportId}/status`, {
        method: 'PUT',
        body: { status: finalStatusToSend },
      });

      fetchAndMergeReports(currentPage, activeStatusKey);
      alert('작업이 완료되었습니다.');
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
      await secureApiRequest(`/admin/reports/${reportId}/unblock`, { method: 'PUT' });
      fetchAndMergeReports(currentPage, activeStatusKey);
      alert('정지 해제 작업이 완료되었습니다.');
    } catch (err) {
      alert('정지 해제에 실패했습니다.');
      console.error(err);
    }
  };

  const getAccumulatedBlockPeriod = (accumulatedReports) => {
    if (accumulatedReports <= 1) return 'BLOCK_3DAYS';
    if (accumulatedReports <= 3) return 'BLOCK_7DAYS';
    if (accumulatedReports <= 5) return 'BLOCK_1MONTH';
    return 'BLOCK_PERMANENT';
  };

  const handleRowClick = async (report) => {
    // targetLoginId 또는 reportedUserLoginId 중 실제 DTO 필드명 사용
    // 신고대상이 삭제된 경우를 확인하는 필드명을 백엔드 DTO와 맞춰주세요.
    if (report.targetLoginId === '알 수 없음' || report.reportedUserLoginId === '알 수 없음') {
      alert('이미 삭제된 컨텐츠입니다.');
      return;
    }

    // 모든 모달 및 로딩 상태 초기화
    setIsPostModalOpen(false);
    setIsCommentModalOpen(false);
    setPostLoading(false);
    setCommentLoading(false);
    setSelectedPost(null);
    setSelectedComment(null);
    setSelectedCommentId(null);

    try {
      const normalizedTargetType = report.targetType.toUpperCase();

      if (normalizedTargetType === 'COMMENT') {
        setCommentLoading(true);
        setIsCommentModalOpen(true);

        console.log('[DEBUG - handleRowClick] Fetching comment details for ID:', report.targetId);
        const res = await secureApiRequest(`/admin/comments/${report.targetId}`, { method: 'GET' });
        setSelectedComment(res.data);
      } else if (normalizedTargetType === 'CONTENT') {
        // 'POST' 대신 'CONTENT'로 변경
        setPostLoading(true);
        setIsPostModalOpen(true);

        console.log('[DEBUG - handleRowClick] Fetching post details for ID:', report.targetId);
        const res = await secureApiRequest(`/admin/board/${report.targetId}`, { method: 'GET' });
        setSelectedPost(res.data);
      } else {
        console.error('[DEBUG] 알 수 없는 신고 대상 타입:', report.targetType);
        alert('알 수 없는 신고 대상입니다.');
      }
    } catch (err) {
      console.error('[DEBUG - handleRowClick] Error during API call:', err);
      if (report.targetType.toUpperCase() === 'COMMENT') {
        setSelectedComment({ error: '댓글 정보를 불러오지 못했습니다.' });
      } else {
        setSelectedPost({ error: '게시글 정보를 불러오지 못했습니다.' });
      }
    } finally {
      setCommentLoading(false);
      setPostLoading(false);
    }
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
    setSelectedCommentId(null);
  };

  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false);
    setSelectedComment(null);
  };

  return (
    <div className={styles.container}>
      {' '}
      {/* .container 클래스 적용 */}
      <h2 className={styles.title}>신고관리</h2> {/* .title 클래스 적용 */}
      <div className={styles.filterTabBar}>
        {' '}
        {/* .filterTabBar 클래스 적용 */}
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={
              tab.key === activeStatusKey ? `${styles.filterTabButton} ${styles.active}` : styles.filterTabButton
            }
            onClick={() => handleTabClick(tab.key)}
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
        <>
          <table className={styles.reportTable}>
            {/* .reportTable 클래스 적용 */}
            <thead className={styles.tableHeader}>
              {/* .tableHeader 클래스 적용 */}
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
                <th>블라인드</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {/* .tableBody 클래스 적용 */}
              {reports.length > 0 ? (
                reports.map((report) => {
                  const isContentDeleted = report.targetLoginId === '알 수 없음'; // targetLoginId 사용

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
                      <td>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '날짜 정보 없음'}</td>
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
                          <span>
                            {report.status === 'REVIEWED'
                              ? '보류'
                              : report.status === 'PROCESSED'
                                ? '처리완료'
                                : '알 수 없음'}
                          </span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {report.targetContentStatus !== 'INACTIVE' && report.status !== 'PROCESSED' ? (
                          <button
                            onClick={() => handleUpdateStatus(report.reportId, 'PROCESSED')}
                            className={`${styles.actionButton} ${styles.dangerButton}`}
                          >
                            블라인드
                          </button>
                        ) : (
                          <span className={styles.disabledActionText}>
                            {report.targetContentStatus === 'INACTIVE' ? '블라인드됨' : '처리완료'}
                          </span>
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
          {reports.length > 0 && pagingData && (
            <PagingView
              currentPage={currentPage}
              totalPage={pagingData.totalPage}
              startPage={pagingData.startPage}
              endPage={pagingData.endPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
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
              <div>
                작성일:{' '}
                {selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleDateString() : '날짜 정보 없음'}
              </div>
              <div style={{ marginTop: 16 }}>{selectedPost.contentBody}</div>
              {Array.isArray(selectedPost.comments) && selectedPost.comments.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3>댓글</h3>
                  <ul style={{ paddingLeft: 0 }}>
                    {selectedPost.comments
                      .filter((comment) => selectedCommentId === null || comment.commentId === selectedCommentId)
                      .map((comment) => (
                        <li
                          key={comment.commentId}
                          style={{
                            marginBottom: 12,
                            listStyle: 'none',
                            borderBottom: '1px solid #eee',
                            paddingBottom: 8,
                            backgroundColor: comment.commentId === selectedCommentId ? '#fff3cd' : 'transparent',
                            padding: comment.commentId === selectedCommentId ? '8px' : '0',
                            borderRadius: comment.commentId === selectedCommentId ? '4px' : '0',
                            border: comment.commentId === selectedCommentId ? '1px solid #ffeeba' : 'none',
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>{comment.userId}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '날짜 정보 없음'}
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
      <Modal isOpen={isCommentModalOpen} onClose={handleCloseCommentModal}>
        {commentLoading ? (
          <div>로딩 중...</div>
        ) : selectedComment ? (
          selectedComment.error ? (
            <div>{selectedComment.error}</div>
          ) : (
            <div style={{ padding: '20px' }}>
              <h3>신고된 댓글 상세</h3>
              <div style={{ marginBottom: '10px' }}>
                <strong>댓글 ID:</strong> {selectedComment.commentId}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>게시글 ID:</strong> {selectedComment.contentId} {/* 댓글이 속한 게시글 ID */}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>작성자:</strong> {selectedComment.nickname || selectedComment.userId}{' '}
                {/* DTO에 nickname 있으면 사용 */}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>작성일:</strong>{' '}
                {selectedComment.createdAt
                  ? new Date(selectedComment.createdAt).toLocaleDateString()
                  : '날짜 정보 없음'}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <strong>내용:</strong> {selectedComment.content}
              </div>
              {/* 필요시 여기에 신고 사유, 상세 정보 등 추가 가능 */}
              <button onClick={handleCloseCommentModal} style={{ padding: '8px 15px', cursor: 'pointer' }}>
                닫기
              </button>
            </div>
          )
        ) : null}
      </Modal>
    </div>
  );
}

export default ReportManagement;
