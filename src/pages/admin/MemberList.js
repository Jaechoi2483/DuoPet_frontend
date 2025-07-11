import React, { useState, useEffect } from 'react';
import styles from './MemberList.module.css';
import apiClient from '../../utils/axios';
import PagingView from '../../components/common/pagingView';

const ROLE_TABS = [
  { label: '전체', value: null },
  { label: '일반', value: 'user' },
  { label: '수의사', value: 'vet' },
  { label: '보호소', value: 'shelter' },
  { label: '관리자', value: 'admin' },
];
const ASSIGNABLE_ROLES = [
  { label: '일반', value: 'user' },
  { label: '수의사', value: 'vet' },
  { label: '보호소', value: 'shelter' },
  { label: '관리자', value: 'admin' },
];
const STATUS_TABS = [
  { label: '전체', value: null },
  { label: '활성', value: 'active' },
  { label: '비활성', value: 'inactive' },
  { label: '정지', value: 'suspended' },
  { label: '승인대기', value: 'waiting' },
  { label: '거절', value: 'rejected' },
];
const ASSIGNABLE_STATUSES = STATUS_TABS.filter((tab) => tab.value !== null);

function MemberList() {
  const [members, setMembers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, number: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [activeRole, setActiveRole] = useState(0);
  const [activeStatus, setActiveStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 회원 목록 불러오기 (백엔드 연동)
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        // API 요청 시 보낼 파라미터 객체 생성
        const params = {
          page: currentPage,
          size: 10,
        };

        // 선택된 탭의 value를 가져옴
        const role = ROLE_TABS[activeRole].value;
        const status = STATUS_TABS[activeStatus].value;

        // value가 null이 아닐 때만 파라미터에 추가 (중요!)
        if (role) params.role = role;
        if (status) params.status = status;

        const response = await apiClient.get('/admin/users', { params });
        setMembers(response.data.content || []);
        setPageInfo(response.data);
      } catch (err) {
        // ... (에러 처리)
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [currentPage, activeRole, activeStatus]);

  // 권한 변경 핸들러 (로컬 상태만)
  const handleUpdate = async (userId, type, value) => {
    try {
      // type에 따라 다른 API 경로와 데이터를 보냄
      await apiClient.patch(`/admin/users/${userId}/${type}`, {
        [type]: value,
      });

      // 성공 시 화면의 데이터만 즉시 업데이트 (새로고침 방지)
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, [type]: value } : m))
      );
      alert('성공적으로 변경되었습니다.');
    } catch (err) {
      alert('변경 중 오류가 발생했습니다.');
      console.error(`${type} 변경 실패:`, err);
    }
  };

  // 4. 필터 클릭 핸들러 (페이지 초기화 포함)
  const handleFilterChange = (filterType, index) => {
    if (filterType === 'role') setActiveRole(index);
    if (filterType === 'status') setActiveStatus(index);
    setCurrentPage(0);
  };

  // PagingView용 페이지 계산
  const pageBlockSize = 10;
  const totalPage = pageInfo.totalPages;
  const currentBlock = Math.floor(currentPage / pageBlockSize);
  const startPage = currentBlock * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPage);

  // PagingView에서 받은 pageNumber(1-based)를 state index(0-based)로 변환
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
  };

  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error)
    return (
      <div className={styles.container} style={{ color: 'red' }}>
        {error}
      </div>
    );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>회원 목록</h2>
      <div className={styles.filterTabsWrap}>
        <div className={styles.filterTabBar}>
          {ROLE_TABS.map((tab, idx) => (
            <button
              key={tab.label}
              className={
                idx === activeRole
                  ? `${styles.filterTabButton} ${styles.active}`
                  : styles.filterTabButton
              }
              onClick={() => handleFilterChange('role', idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.filterTabBar}>
          {STATUS_TABS.map((tab, idx) => (
            <button
              key={tab.label}
              className={
                idx === activeStatus
                  ? `${styles.filterTabButton} ${styles.active}`
                  : styles.filterTabButton
              }
              onClick={() => handleFilterChange('status', idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <table className={styles.memberTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th>ID</th>
            <th>로그인ID</th>
            <th>이름</th>
            <th>역할</th>
            <th>상태</th>
            <th>가입일</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {members.length > 0 ? (
            members.map((member) => (
              <tr key={member.userId}>
                <td>{member.userId}</td>
                <td>{member.loginId}</td>
                <td>{member.userName}</td>
                <td>
                  <select
                    className={styles.select}
                    value={member.role}
                    onChange={(e) =>
                      handleUpdate(member.userId, 'role', e.target.value)
                    }
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className={styles.select}
                    value={member.status}
                    onChange={(e) =>
                      handleUpdate(member.userId, 'status', e.target.value)
                    }
                  >
                    {/* ✅ 상수를 사용하여 동적으로 옵션 생성 */}
                    {ASSIGNABLE_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{new Date(member.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className={styles.noData}>
                해당 조건의 회원이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PagingView 컴포넌트로 교체 */}
      {totalPage > 1 && (
        <PagingView
          currentPage={currentPage + 1}
          totalPage={totalPage}
          startPage={startPage}
          endPage={endPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
export default MemberList;
