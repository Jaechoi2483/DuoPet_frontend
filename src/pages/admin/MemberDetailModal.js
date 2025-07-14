import React, { useState } from 'react';
import styles from './MemberDetailModal.module.css';
import MemberDetailInfoModal from './MemberDetailInfoModal';
import Modal from '../../components/common/Modal';

function MemberDetailModal({ member, isOpen, onClose }) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  if (!isOpen || !member) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      user: '일반',
      vet: '수의사',
      shelter: '보호소',
      admin: '관리자',
    };
    return roleMap[role] || role;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      active: '활성',
      inactive: '비활성',
      suspended: '정지',
      waiting: '승인대기',
      rejected: '거절',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: '#4CAF50',
      inactive: '#757575',
      suspended: '#D32F2F',
      waiting: '#F57C00',
      rejected: '#C62828',
    };
    return colorMap[status] || '#666';
  };

  const handleInfoButtonClick = () => {
    setIsInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>회원 상세 정보</h2>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <label className={styles.label}>회원번호:</label>
              <span className={styles.value}>{member.userId}</span>
            </div>
            <div className={styles.infoRow}>
              <label className={styles.label}>로그인 ID:</label>
              <span className={styles.value}>{member.loginId}</span>
            </div>
            <div className={styles.infoRow}>
              <label className={styles.label}>이름:</label>
              <span className={styles.value}>{member.userName}</span>
            </div>
            <div className={styles.infoRow}>
              <label className={styles.label}>닉네임:</label>
              <span className={styles.value}>{member.nickname || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <label className={styles.label}>이메일:</label>
              <span className={styles.value}>{member.userEmail || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <label className={styles.label}>전화번호:</label>
              <span className={styles.value}>{member.phone || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <label className={styles.label}>역할:</label>
              <span className={styles.value}>
                <span className={styles.roleBadge}>{getRoleLabel(member.role)}</span>
              </span>
            </div>
            <div className={styles.infoRow}>
              <label className={styles.label}>상태:</label>
              <span className={styles.value}>
                <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(member.status) }}>
                  {getStatusLabel(member.status)}
                </span>
              </span>
            </div>
            <div className={styles.infoRow}>
              <label className={styles.label}>가입일:</label>
              <span className={styles.value}>{formatDate(member.createdAt)}</span>
            </div>
            {member.updatedAt && (
              <div className={styles.infoRow}>
                <label className={styles.label}>최종 수정일:</label>
                <span className={styles.value}>{formatDate(member.updatedAt)}</span>
              </div>
            )}
          </div>
          {member.address && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>주소 정보</h3>
              <div className={styles.addressInfo}>
                <p className={styles.addressText}>{member.address}</p>
              </div>
            </div>
          )}
          {member.bio && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>자기소개</h3>
              <div className={styles.bioText}>
                <p>{member.bio}</p>
              </div>
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          {(member.role === 'vet' || member.role === 'shelter') && (
            <button className={styles.infoButton} onClick={handleInfoButtonClick}>
              상세 정보 보기
            </button>
          )}
          <button className={styles.closeModalButton} onClick={onClose}>
            닫기
          </button>
        </div>
      </Modal>
      {/* 수의사/보호소 상세 정보 모달 */}
      <MemberDetailInfoModal
        member={member}
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
      />
    </>
  );
}

export default MemberDetailModal;
