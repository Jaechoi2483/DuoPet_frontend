import React, { useState, useEffect } from 'react';
import styles from './MemberList.module.css';
import apiClient from '../../utils/axios';

const ROLE_TABS = [
  { label: '전체', value: null },
  { label: '일반', value: 'USER' },
  { label: '수의사', value: 'VET' },
  { label: '전문가', value: 'EXPERT' },
];
const STATUS_TABS = [
  { label: '전체', value: null },
  { label: '승인대기', value: 'PENDING' },
  { label: '활성', value: 'ACTIVE' },
  { label: '정지', value: 'SUSPENDED' },
];

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
        const params = {
          page: currentPage,
          size: 10,
          role: ROLE_TABS[activeRole].value,
          status: STATUS_TABS[activeStatus].value,
        };
        // API 경로를 이전에 설계한 '/admin/users'로 수정
        const response = await apiClient.get('/admin/users', { params });
        setMembers(response.data.content || []);
        setPageInfo(response.data);
      } catch (err) {
        setError('회원 목록을 불러오지 못했습니다.');
        setMembers([]);
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
            <th>이메일</th>
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
                <td>{member.userEmail}</td>
                <td>
                  <select
                    className={styles.select}
                    value={member.role}
                    onChange={(e) =>
                      handleUpdate(member.userId, 'role', e.target.value)
                    }
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    {/* 필요시 다른 역할 추가 */}
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
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </td>
                <td>{new Date(member.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className={styles.noData}>
                해당 조건의 회원이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 5. 서버사이드 페이지네이션 UI */}
      {pageInfo.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={pageInfo.first}
          >
            이전
          </button>
          <span>
            {pageInfo.number + 1} / {pageInfo.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={pageInfo.last}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
export default MemberList;
