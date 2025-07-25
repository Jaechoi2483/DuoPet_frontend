import React, { useState } from 'react';
import Modal from '../common/Modal';
import styles from './InstantConsultModal.module.css';

const InstantConsultModal = ({ 
  isOpen, 
  onClose, 
  expert, 
  userPets, 
  onConfirm,
  isLoading 
}) => {
  const [selectedPetId, setSelectedPetId] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const handleSubmit = () => {
    console.log('InstantConsultModal handleSubmit 호출됨', { selectedPetId, symptoms });
    
    if (!selectedPetId) {
      alert('반려동물을 선택해주세요.');
      return;
    }
    if (!symptoms.trim()) {
      alert('증상을 입력해주세요.');
      return;
    }
    
    console.log('onConfirm 호출 전', { selectedPetId, symptoms, onConfirm });
    onConfirm(selectedPetId, symptoms);
    console.log('onConfirm 호출 후');
  };

  const handleClose = () => {
    setSelectedPetId('');
    setSymptoms('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="즉시 상담 요청"
    >
      <div className={styles.modalContent}>
        {/* 전문가 정보 */}
        <div className={styles.expertInfo}>
          <div className={styles.expertImage}>
            {expert?.vet?.user?.renameFilename ? (
              <img 
                src={`${process.env.REACT_APP_API_BASE_URL}/upload/userprofile/${expert.vet.user.renameFilename}`} 
                alt={expert.vet?.name} 
              />
            ) : (
              <div className={styles.defaultImage}>
                <span>{expert?.vet?.name?.charAt(0) || '?'}</span>
              </div>
            )}
          </div>
          <div className={styles.expertDetails}>
            <h3>{expert?.vet?.name || '이름 없음'}</h3>
            <p>{expert?.vet?.specialization || '전문 분야 없음'}</p>
            <p className={styles.statusOnline}>🟢 현재 온라인</p>
          </div>
        </div>

        {/* 상담 안내 */}
        <div className={styles.infoSection}>
          <h4>즉시 상담 안내</h4>
          <ul className={styles.infoList}>
            <li>상담 요청 후 전문가 승인 시 바로 상담이 시작됩니다.</li>
            <li>전문가가 30초 내에 응답하지 않으면 자동 취소됩니다.</li>
            <li>상담료: 20,000원 (20분 기준)</li>
            <li>채팅 상담으로 진행됩니다.</li>
          </ul>
        </div>

        {/* 반려동물 선택 */}
        <div className={styles.formSection}>
          <label className={styles.label}>반려동물 선택</label>
          <select 
            className={styles.select}
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
          >
            <option value="">반려동물을 선택하세요</option>
            {userPets.map(pet => (
              <option key={pet.petId} value={pet.petId}>
                {pet.name} ({pet.species} - {pet.breed}, {pet.age}살)
              </option>
            ))}
          </select>
        </div>

        {/* 증상 입력 */}
        <div className={styles.formSection}>
          <label className={styles.label}>현재 증상</label>
          <textarea
            className={styles.textarea}
            placeholder="반려동물의 현재 증상을 간단히 설명해주세요..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            maxLength={200}
          />
          <div className={styles.charCount}>
            {symptoms.length}/200
          </div>
        </div>

        {/* 버튼 */}
        <div className={styles.buttonGroup}>
          <button 
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </button>
          <button 
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={isLoading || !selectedPetId || !symptoms.trim()}
          >
            {isLoading ? '요청 중...' : '상담 요청'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InstantConsultModal;