import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ConsultationHistory.module.css';
import { consultationRoomApi, consultationReviewApi, qnaConsultationApi } from '../../../../api/consultationApi';
import Loading from '../../../../components/common/Loading';
import Modal from '../../../../components/common/Modal';

const ConsultationHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [consultations, setConsultations] = useState([]);
  const [qnaConsultations, setQnaConsultations] = useState([]);
  
  // 초기 activeTab 설정 - 항상 'realtime'이 기본값
  const [activeTab, setActiveTab] = useState('realtime');
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

  // 다른 페이지에서 특정 탭으로 직접 이동한 경우에만 처리
  useEffect(() => {
    if (location.state?.activeTab === 'qna') {
      setActiveTab('qna');
    }
  }, [location.state?.activeTab]);

  useEffect(() => {
    if (activeTab === 'realtime') {
      loadConsultations();
    } else {
      loadQnaConsultations();
    }
  }, [activeTab]);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      
      // 실시간 상담은 CHAT 타입만 조회
      const response = await consultationRoomApi.getMyConsultations('CHAT');
      console.log('Consultation API response (CHAT type):', response);
      console.log('Response structure:', {
        success: response?.success,
        data: response?.data,
        dataType: typeof response?.data,
        isPageable: response?.data?.content !== undefined,
        contentLength: response?.data?.content?.length || response?.data?.length || 0
      });
      
      // 날짜 데이터 디버깅
      if (response?.data?.content?.[0]) {
        console.log('=== 첫 번째 상담 전체 데이터 ===');
        console.log(JSON.stringify(response.data.content[0], null, 2));
        console.log('scheduledDatetime:', response.data.content[0].scheduledDatetime);
        console.log('createdAt:', response.data.content[0].createdAt);
        console.log('startedAt:', response.data.content[0].startedAt);
        console.log('endedAt:', response.data.content[0].endedAt);
      }
      
      if (response && response.data) {
        // response.data가 페이지네이션 객체인 경우 content 필드 사용
        if (response.data.content !== undefined) {
          console.log('Using paginated content:', response.data.content);
          setConsultations(response.data.content);
        } else if (Array.isArray(response.data)) {
          console.log('Using array data:', response.data);
          setConsultations(response.data);
        } else {
          console.log('Unexpected data format:', response.data);
          setConsultations([]);
        }
      } else {
        console.log('No data in response');
        setConsultations([]);
      }
    } catch (err) {
      setError('상담 내역을 불러오는데 실패했습니다.');
      console.error('Error loading consultations:', err);
      console.error('Error details:', err.response);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQnaConsultations = async () => {
    setLoading(true);
    try {
      // 디버깅을 위해 localStorage 확인
      console.log('=== Q&A API 호출 전 확인 ===');
      console.log('userId in localStorage:', localStorage.getItem('userId'));
      console.log('accessToken exists:', !!localStorage.getItem('accessToken'));
      console.log('refreshToken exists:', !!localStorage.getItem('refreshToken'));
      
      const response = await qnaConsultationApi.getMyQnaConsultations();
      console.log('Q&A Consultation API response:', response);
      console.log('Q&A Response structure:', {
        success: response?.success,
        data: response?.data,
        dataType: typeof response?.data,
        isArray: Array.isArray(response?.data),
        hasContent: response?.data?.content !== undefined,
        contentLength: response?.data?.content?.length || response?.data?.length || 0
      });
      
      // 응답 데이터 상세 확인
      if (response?.data?.content) {
        console.log('Q&A 상담 목록 (content):', response.data.content);
        console.log('첫 번째 상담 데이터:', response.data.content[0]);
      } else if (Array.isArray(response?.data)) {
        console.log('Q&A 상담 목록 (array):', response.data);
        console.log('첫 번째 상담 데이터:', response.data[0]);
      }
      
      if (response && response.data) {
        // response.data가 페이지네이션 객체인 경우 content 필드 사용
        if (response.data.content !== undefined) {
          console.log('Using paginated content:', response.data.content);
          setQnaConsultations(response.data.content);
        } else if (Array.isArray(response.data)) {
          console.log('Using array data:', response.data);
          setQnaConsultations(response.data);
        } else {
          console.log('Unexpected data format:', response.data);
          setQnaConsultations([]);
        }
      } else {
        console.log('No data in response');
        setQnaConsultations([]);
      }
    } catch (err) {
      setError('Q&A 상담 내역을 불러오는데 실패했습니다.');
      console.error('Error loading Q&A consultations:', err);
      console.error('Error details:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      setQnaConsultations([]);
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
      'NO_SHOW': '노쇼',
      'PENDING': '답변대기',
      'ANSWERED': '답변완료',
      'CREATED': '답변대기'  // Q&A 상담용
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'SCHEDULED': styles.scheduled,
      'IN_PROGRESS': styles.inProgress,
      'COMPLETED': styles.completed,
      'CANCELLED': styles.cancelled,
      'NO_SHOW': styles.noShow,
      'PENDING': styles.pending,
      'ANSWERED': styles.answered,
      'CREATED': styles.pending  // Q&A 상담용 - pending과 같은 스타일 사용
    };
    return classMap[status] || '';
  };

  const handleConsultationClick = (consultation) => {
    if (consultation.roomStatus === 'IN_PROGRESS') {
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
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>상담 내역</h2>
        <div className={styles.sectionTabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'realtime' ? styles.active : ''}`}
            style={activeTab === 'realtime' ? { backgroundColor: '#4A9FF3', color: 'white' } : {}}
            onClick={() => setActiveTab('realtime')}
          >
            실시간 상담
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'qna' ? styles.active : ''}`}
            style={activeTab === 'qna' ? { backgroundColor: '#4A9FF3', color: 'white' } : {}}
            onClick={() => setActiveTab('qna')}
          >
            Q&A 상담
          </button>
        </div>
      </div>
      
      <div className={styles.sectionContent}>
        {activeTab === 'realtime' && consultations.length === 0 ? (
          <div className={styles.empty}>
          <p>상담 내역이 없습니다.</p>
          <button 
            className={styles.newConsultationBtn}
            onClick={() => navigate('/health/expert-consult')}
          >
            실시간 상담 신청하기
          </button>
        </div>
      ) : activeTab === 'qna' && qnaConsultations.length === 0 ? (
        <div className={styles.empty}>
          <p>Q&A 상담 내역이 없습니다.</p>
          <button 
            className={styles.newConsultationBtn}
            onClick={() => navigate('/health/qna-consultation')}
          >
            Q&A 상담 요청하기
          </button>
        </div>
      ) : (
        <div className={styles.consultationList}>
          {activeTab === 'realtime' ? consultations.map(consultation => (
            <div 
              key={consultation.roomId} 
              className={styles.consultationCard}
              onClick={() => handleConsultationClick(consultation)}
            >
              <div className={styles.consultationHeader}>
                <div className={styles.vetInfo}>
                  <h3>{consultation.vetName}</h3>
                  <span className={styles.specialty}>일반진료</span>
                </div>
                <span className={`${styles.status} ${getStatusClass(consultation.roomStatus)}`}>
                  {getStatusLabel(consultation.roomStatus)}
                </span>
              </div>
              
              <div className={styles.consultationBody}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>상담일시:</span>
                  <span>
                    {(() => {
                      // 날짜 변환 함수
                      const convertDate = (dateValue) => {
                        if (!dateValue) return null;
                        
                        // 배열 형식인 경우 [year, month, day, hour, minute, second, nano]
                        if (Array.isArray(dateValue) && dateValue.length >= 6) {
                          const [year, month, day, hour, minute, second] = dateValue;
                          return new Date(year, month - 1, day, hour, minute, second);
                        }
                        
                        // 문자열 형식인 경우
                        const date = new Date(dateValue);
                        if (date instanceof Date && !isNaN(date.getTime())) {
                          return date;
                        }
                        
                        return null;
                      };
                      
                      const scheduleDate = convertDate(consultation.scheduledDatetime);
                      const createDate = convertDate(consultation.createdAt);
                      const endDate = convertDate(consultation.endedAt);
                      
                      if (scheduleDate && scheduleDate.getFullYear() > 1970) {
                        return scheduleDate.toLocaleDateString();
                      } else if (createDate && createDate.getFullYear() > 1970) {
                        return createDate.toLocaleDateString();
                      } else if (endDate && endDate.getFullYear() > 1970) {
                        return endDate.toLocaleDateString();
                      } else {
                        return '날짜 정보 없음';
                      }
                    })()}
                  </span>
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
                {consultation.roomStatus === 'COMPLETED' && (
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
                {consultation.roomStatus === 'IN_PROGRESS' && (
                  <button className={styles.enterBtn}>
                    상담방 입장
                  </button>
                )}
              </div>
            </div>
          )) : qnaConsultations.map(qna => (
            <div 
              key={qna.roomId} 
              className={styles.consultationCard}
              onClick={() => navigate(`/health/qna-consultation/${qna.roomId}`)}
            >
              <div className={styles.consultationHeader}>
                <div className={styles.vetInfo}>
                  <h3>{qna.vetName}</h3>
                  <span className={styles.specialty}>{qna.category || '기타'}</span>
                </div>
                <span className={`${styles.status} ${getStatusClass(qna.roomStatus || qna.status)}`}>
                  {getStatusLabel(qna.roomStatus || qna.status)}
                </span>
              </div>
              
              <div className={styles.consultationBody}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>제목:</span>
                  <span>{qna.title}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>작성일:</span>
                  <span>{qna.createdAt ? new Date(qna.createdAt).toLocaleDateString() : '날짜 정보 없음'}</span>
                </div>
                {qna.hasAnswer && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>답변 상태:</span>
                    <span>답변 완료</span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.label}>반려동물:</span>
                  <span>{qna.petName}</span>
                </div>
              </div>

              <div className={styles.consultationFooter}>
                <button className={styles.viewDetailBtn}>
                  상세보기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

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
              <p>전문분야: 일반진료</p>
            </div>
            
            <div className={styles.detailSection}>
              <h4>상담 정보</h4>
              <p>일시: {(() => {
                      const convertDate = (dateValue) => {
                        if (!dateValue) return null;
                        
                        if (Array.isArray(dateValue) && dateValue.length >= 6) {
                          const [year, month, day, hour, minute, second] = dateValue;
                          return new Date(year, month - 1, day, hour, minute, second);
                        }
                        
                        const date = new Date(dateValue);
                        if (date instanceof Date && !isNaN(date.getTime())) {
                          return date;
                        }
                        
                        return null;
                      };
                      
                      const scheduleDate = convertDate(selectedConsultation.scheduledDatetime);
                      const createDate = convertDate(selectedConsultation.createdAt);
                      const endDate = convertDate(selectedConsultation.endedAt);
                      
                      if (scheduleDate && scheduleDate.getFullYear() > 1970) {
                        return scheduleDate.toLocaleDateString();
                      } else if (createDate && createDate.getFullYear() > 1970) {
                        return createDate.toLocaleDateString();
                      } else if (endDate && endDate.getFullYear() > 1970) {
                        return endDate.toLocaleDateString();
                      } else {
                        return '날짜 정보 없음';
                      }
                    })()}</p>
              <p>방식: {selectedConsultation.consultationType === 'VIDEO' ? '화상상담' : 
                       selectedConsultation.consultationType === 'CHAT' ? '채팅상담' : '전화상담'}</p>
              <p>상태: {getStatusLabel(selectedConsultation.roomStatus)}</p>
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