import React, { useState, useEffect } from 'react';
import styles from './MemberList.module.css';
import apiClient from '../../utils/axios';

const ROLE_TABS = [
  { label: '전체' },
  { label: '일반' },
  { label: '수의사' },
  { label: '전문가' },
];
const STATUS_TABS = [
  { label: '전체' },
  { label: '승인대기' },
  { label: '승인완료' },
];

const ROLE_OPTIONS = ['일반', '수의사', '전문가'];
const STATUS_OPTIONS = ['승인대기', '승인완료'];

function MemberList() {
  const [activeRole, setActiveRole] = useState(0);
  const [activeStatus, setActiveStatus] = useState(0);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 회원 목록 불러오기 (백엔드 연동)
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        // 실제 API 경로에 맞게 수정 필요
        const response = await apiClient.get('/api/members');
        setMembers(response.data || []);
      } catch (err) {
        setError('회원 목록을 불러오지 못했습니다.');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // 권한 변경 핸들러 (로컬 상태만)
  const handleRoleChange = (idx, newRole) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, role: newRole } : m))
    );
  };
  // 승인상태 변경 핸들러 (로컬 상태만)
  const handleStatusChange = (idx, newStatus) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, status: newStatus } : m))
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>회원 목록</h2>

      {/* 2중 탭: 권한, 승인상태 */}
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
              onClick={() => setActiveRole(idx)}
              type="button"
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
              onClick={() => setActiveStatus(idx)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>로딩 중...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'red' }}>{error}</div>
      ) : (
        <>
          <table className={styles.memberTable}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>번호</th>
                <th>아이디</th>
                <th>이름</th>
                <th>이메일</th>
                <th>권한</th>
                <th>승인상태</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {members.length > 0 ? (
                members.map((member, idx) => (
                  <tr key={member.id}>
                    <td>{idx + 1}</td>
                    <td>{member.username}</td>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <select
                        className={styles.select}
                        value={member.role}
                        onChange={e => handleRoleChange(idx, e.target.value)}
                      >
                        {ROLE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className={styles.select}
                        value={member.status}
                        onChange={e => handleStatusChange(idx, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td>{member.joined}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.noData}>
                    회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        </>
      )}
    </div>
  );
}

export default MemberList; 