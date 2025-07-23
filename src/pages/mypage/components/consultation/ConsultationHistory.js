import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConsultationHistory.module.css';
import { consultationRoomApi, consultationReviewApi } from '../../../../api/consultationApi';
import Loading from '../../../../components/common/Loading';
import Modal from '../../../../components/common/Modal';

const ConsultationHistory = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    kindnessScore: 5,
    professionalScore: 5,
    responseScore: 5,
    reviewContent: ''
  });

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const response = await consultationRoomApi.getMyConsultations();
      if (response.success) {
        setConsultations(response.data);
      }
    } catch (err) {
      setError('상담 내역을 불러오는데 실패했습니다.');
      console.error('Error loading consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'SCHEDULED': '예약완료',
      'IN_PROGRESS': '진행중',
      'COMPLETED': '완료',
      'CANCELLED': '취소됨',
      'NO_SHOW': '노쇼'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'SCHEDULED': styles.scheduled,
      'IN_PROGRESS': styles.inProgress,
      'COMPLETED': styles.completed,
      'CANCELLED': styles.cancelled,
      'NO_SHOW': styles.noShow
    };
    return classMap[status] || '';
  };

  const handleConsultationClick = (consultation) => {
    if (consultation.status === 'IN_PROGRESS') {
      // 진행중인 상담은 채팅방으로 이동
      navigate(`/consultation/chat/${consultation.roomId}`);
    } else {
      setSelectedConsultation(consultation);
    }
  };

  const handleReviewClick = (consultation) => {
    setSelectedConsultation(consultation);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!reviewData.reviewContent.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    try {
      const review = {
        consultationRoomId: selectedConsultation.roomId,
        vetId: selectedConsultation.vetId,
        rating: reviewData.rating,
        kindnessScore: reviewData.kindnessScore,
        professionalScore: reviewData.professionalScore,
        responseScore: reviewData.responseScore,
        reviewContent: reviewData.reviewContent
      };

      const response = await consultationReviewApi.createReview(review);
      if (response.success) {
        alert('후기가 작성되었습니다.');
        setShowReviewModal(false);
        resetReviewData();
        loadConsultations(); // 리스트 새로고침
      }
    } catch (err) {
      alert('후기 작성에 실패했습니다.');
      console.error('Review submit error:', err);
    }
  };

  const resetReviewData = () => {
    setReviewData({
      rating: 5,
      kindnessScore: 5,
      professionalScore: 5,
      responseScore: 5,
      reviewContent: ''
    });
  };

  if (loading) {
    return <Loading message="상담 내역을 불러오는 중..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>상담 내역</h2>
      
      {consultations.length === 0 ? (
        <div className={styles.empty}>
          <p>상담 내역이 없습니다.</p>
          <button 
            className={styles.newConsultationBtn}
            onClick={() => navigate('/health/expert-consult')}
          >
            상담 예약하기
          </button>
        </div>
      ) : (
        <div className={styles.consultationList}>
          {consultations.map(consultation => (
            <div 
              key={consultation.roomId} 
              className={styles.consultationCard}
              onClick={() => handleConsultationClick(consultation)}
            >
              <div className={styles.consultationHeader}>
                <div className={styles.vetInfo}>
                  <h3>{consultation.vetName}</h3>
                  <span className={styles.specialty}>{consultation.vetSpecialty}</span>
                </div>
                <span className={`${styles.status} ${getStatusClass(consultation.status)}`}>
                  {getStatusLabel(consultation.status)}
                </span>
              </div>
              
              <div className={styles.consultationBody}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>상담일시:</span>
                  <span>{new Date(consultation.scheduledAt).toLocaleString()}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>상담방식:</span>
                  <span>{consultation.consultationType === 'VIDEO' ? '화상상담' : 
                         consultation.consultationType === 'CHAT' ? '채팅상담' : '전화상담'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>반려동물:</span>
                  <span>{consultation.petName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>상담료:</span>
                  <span>{consultation.consultationFee?.toLocaleString()}원</span>
                </div>
              </div>

              <div className={styles.consultationFooter}>
                {consultation.status === 'COMPLETED' && !consultation.hasReview && (
                  <button 
                    className={styles.reviewBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReviewClick(consultation);
                    }}
                  >
                    후기 작성
                  </button>
                )}
                {consultation.status === 'IN_PROGRESS' && (
                  <button className={styles.enterBtn}>
                    상담방 입장
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 상담 상세 모달 */}
      {selectedConsultation && !showReviewModal && (
        <Modal
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          title="상담 상세 정보"
        >
          <div className={styles.consultationDetail}>
            <div className={styles.detailSection}>
              <h4>수의사 정보</h4>
              <p>이름: {selectedConsultation.vetName}</p>
              <p>전문분야: {selectedConsultation.vetSpecialty}</p>
            </div>
            
            <div className={styles.detailSection}>
              <h4>상담 정보</h4>
              <p>일시: {new Date(selectedConsultation.scheduledAt).toLocaleString()}</p>
              <p>방식: {selectedConsultation.consultationType === 'VIDEO' ? '화상상담' : 
                       selectedConsultation.consultationType === 'CHAT' ? '채팅상담' : '전화상담'}</p>
              <p>상태: {getStatusLabel(selectedConsultation.status)}</p>
            </div>
            
            <div className={styles.detailSection}>
              <h4>반려동물</h4>
              <p>{selectedConsultation.petName}</p>
            </div>
            
            <div className={styles.detailSection}>
              <h4>주요 증상</h4>
              <p>{selectedConsultation.chiefComplaint}</p>
            </div>
            
            {selectedConsultation.consultationNotes && (
              <div className={styles.detailSection}>
                <h4>상담 기록</h4>
                <p>{selectedConsultation.consultationNotes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 후기 작성 모달 */}
      {showReviewModal && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            resetReviewData();
          }}
          title="상담 후기 작성"
        >
          <div className={styles.reviewModal}>
            <div className={styles.reviewSection}>
              <label>전체 평점</label>
              <div className={styles.starRating}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={star <= reviewData.rating ? styles.starFilled : styles.starEmpty}
                    onClick={() => setReviewData({...reviewData, rating: star})}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.scoreGrid}>
              <div className={styles.scoreItem}>
                <label>친절도</label>
                <select 
                  value={reviewData.kindnessScore}
                  onChange={(e) => setReviewData({...reviewData, kindnessScore: Number(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}점</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.scoreItem}>
                <label>전문성</label>
                <select 
                  value={reviewData.professionalScore}
                  onChange={(e) => setReviewData({...reviewData, professionalScore: Number(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}점</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.scoreItem}>
                <label>응답속도</label>
                <select 
                  value={reviewData.responseScore}
                  onChange={(e) => setReviewData({...reviewData, responseScore: Number(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}점</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.reviewSection}>
              <label>상담 후기</label>
              <textarea
                className={styles.reviewTextarea}
                placeholder="상담은 어떠셨나요? 다른 보호자들에게 도움이 될 수 있도록 후기를 남겨주세요."
                value={reviewData.reviewContent}
                onChange={(e) => setReviewData({...reviewData, reviewContent: e.target.value})}
                rows={5}
              />
            </div>

            <div className={styles.reviewButtons}>
              <button 
                className={styles.cancelBtn}
                onClick={() => {
                  setShowReviewModal(false);
                  resetReviewData();
                }}
              >
                취소
              </button>
              <button 
                className={styles.submitBtn}
                onClick={handleReviewSubmit}
              >
                후기 등록
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ConsultationHistory;