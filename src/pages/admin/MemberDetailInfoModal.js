import React, { useState, useEffect } from 'react';
import styles from './MemberDetailInfoModal.module.css';
import apiClient from '../../utils/axios';
import FilePreview from '../../components/common/FilePreview';
import Modal from '../../components/common/Modal';

// ✨ 수정: props로 넘어오는 member는 userId를 포함한 기본 정보만 있어도 됩니다.
function MemberDetailInfoModal({ member, isOpen, onClose }) {
  // ✨ 수정: 상세 정보를 저장할 새로운 state와 로딩 상태를 추가합니다.
  const [detailedMember, setDetailedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✨ 수정: 모달이 열리거나 대상 member가 바뀔 때마다 상세 정보를 불러옵니다.
  useEffect(() => {
    // 모달이 열리고, member 객체가 존재할 때만 API를 호출합니다.
    if (isOpen && member?.userId) {
      setIsLoading(true); // 로딩 시작
      setDetailedMember(null); // 이전 데이터 초기화

      // 백엔드에 상세 정보 API를 호출합니다.
      // fetch → apiClient로 변경
      apiClient
        .get(`/admin/users/${member.userId}`)
        .then((res) => {
          setDetailedMember(res.data);
        })
        .catch((error) => {
          console.error('상세 정보 조회 오류:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, member?.userId]); // isOpen이나 userId가 변경될 때마다 실행

  // 모달이 닫혀있거나, 데이터가 없으면 아무것도 렌더링하지 않습니다.
  if (!isOpen) return null;

  // ✨ 수정: detailedMember에서 데이터를 분리합니다.
  const { vetProfile, shelterProfile, ...user } = detailedMember || {};

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role) => {
    const roleMap = { vet: '수의사', shelter: '보호소', admin: '관리자', user: '일반회원' };
    return roleMap[role] || role;
  };

  const renderVetInfo = () => {
    if (!vetProfile) return null;
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>수의사 정보</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <label className={styles.label}>전문가 ID:</label>
            <span className={styles.value}>{vetProfile.vetId || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>이름:</label>
            <span className={styles.value}>{vetProfile.name || user.userName || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>면허번호:</label>
            <span className={styles.value}>{vetProfile.licenseNumber || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>전문분야:</label>
            <span className={styles.value}>{vetProfile.specialization || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>전화번호:</label>
            <span className={styles.value}>{vetProfile.phone || user.phone || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>이메일:</label>
            <span className={styles.value}>{vetProfile.email || user.userEmail || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>병원주소:</label>
            <span className={styles.value}>{vetProfile.address || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>웹사이트:</label>
            <span className={styles.value}>
              {vetProfile.website ? (
                <a href={vetProfile.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                  {vetProfile.website}
                </a>
              ) : (
                '-'
              )}
            </span>
          </div>
          {vetProfile.vetFileOriginalFilename && (
            <div className={styles.infoRow}>
              <label className={styles.label}>면허증 파일:</label>
              <span className={styles.value}>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{vetProfile.vetFileOriginalFilename}</div>
                  <FilePreview
                    fileUrl={`/admin/files/vet/${vetProfile.vetFileRenameFilename}`}
                    fileName={vetProfile.vetFileOriginalFilename}
                  />
                </div>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderShelterInfo = () => {
    if (!shelterProfile) return null;
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>보호소 정보</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <label className={styles.label}>보호소 ID:</label>
            <span className={styles.value}>{shelterProfile.shelterId || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>보호소명:</label>
            <span className={styles.value}>{shelterProfile.shelterName || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>보호소주소:</label>
            <span className={styles.value}>{shelterProfile.address || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>보호소전화:</label>
            <span className={styles.value}>{shelterProfile.phone || user.phone || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>이메일:</label>
            <span className={styles.value}>{shelterProfile.email || user.userEmail || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>웹사이트:</label>
            <span className={styles.value}>
              {shelterProfile.website ? (
                <a
                  href={shelterProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  {shelterProfile.website}
                </a>
              ) : (
                '-'
              )}
            </span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>수용가능동물:</label>
            <span className={styles.value}>{shelterProfile.capacity ? `${shelterProfile.capacity}마리` : '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>운영시간:</label>
            <span className={styles.value}>{shelterProfile.operatingHours || '-'}</span>
          </div>
          {shelterProfile.shelterFileOriginalFilename && (
            <div className={styles.infoRow}>
              <label className={styles.label}>인증파일:</label>
              <span className={styles.value}>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{shelterProfile.shelterFileOriginalFilename}</div>
                  {shelterProfile.authFileDescription && (
                    <div className={styles.fileDescription}>{shelterProfile.authFileDescription}</div>
                  )}
                  <FilePreview
                    fileUrl={`/admin/files/shelter/${shelterProfile.shelterFileRenameFilename}`}
                    fileName={shelterProfile.shelterFileOriginalFilename}
                  />
                </div>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderModalBody = () => {
    if (isLoading) {
      return <div className={styles.loading}>상세 정보를 불러오는 중입니다...</div>;
    }
    if (!detailedMember) {
      // 로딩이 끝났지만 데이터가 없는 경우 (에러 등)
      return (
        <div className={styles.noData}>
          <p>정보를 불러올 수 없습니다.</p>
        </div>
      );
    }
    return (
      <>
        {vetProfile && renderVetInfo()}
        {shelterProfile && renderShelterInfo()}
        {!(vetProfile || shelterProfile) && (
          <div className={styles.noData}>
            <p>추가 정보가 등록되지 않았습니다.</p>
          </div>
        )}
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>
          {detailedMember?.userName || member.userName} ({getRoleLabel(detailedMember?.role || member.role)}) 상세 정보
        </h2>
      </div>
      <div className={styles.modalBody}>
        {renderModalBody()}
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.closeModalButton} onClick={onClose}>닫기</button>
      </div>
    </Modal>
  );
}

export default MemberDetailInfoModal;
