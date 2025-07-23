

// src/pages/health/ExpertConsult.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExpertConsult.module.css';
import { vetProfileApi, consultationRoomApi, vetScheduleApi } from '../../api/consultationApi';
import { getPetList, getPetImageUrl } from '../../api/petApi';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import PagingView from '../../components/common/pagingView';

const ExpertConsult = () => {
  const navigate = useNavigate();
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [consultationType, setConsultationType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [experts, setExperts] = useState([]);
  const [vetSchedules, setVetSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [userPets, setUserPets] = useState([]);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 필터 및 정렬 상태
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('createdAt,desc');
  const [onlineOnly, setOnlineOnly] = useState(false);

  // 컴포넌트 마운트 시 전문가 목록 로드
  useEffect(() => {
    loadExperts();
    loadUserPets();
  }, [currentPage, filterSpecialty, sortBy, onlineOnly]);

  // 선택한 날짜가 변경되면 해당 날짜의 일정 로드
  useEffect(() => {
    if (selectedExpert && selectedDate) {
      loadVetSchedules(selectedExpert.vetId, selectedDate);
    }
  }, [selectedDate, selectedExpert]);

  // 전문가 목록 로드
  const loadExperts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vetProfileApi.getAllAvailable(
        currentPage - 1, // 백엔드는 0부터 시작
        6, // 페이지당 6개
        sortBy,
        filterSpecialty || null,
        onlineOnly || null
      );
      console.log('전문가 목록 API 응답:', response);
      
      if (response && response.data) {
        const pageData = response.data;
        console.log('Page data:', pageData);
        
        // Page 객체에서 데이터 추출
        const expertsData = pageData.content || [];
        
        setExperts(expertsData);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      } else {
        setExperts([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Error loading experts:', err);
      setError('전문가 목록을 불러오는데 실패했습니다.');
      setExperts([]);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 반려동물 목록 로드
  const loadUserPets = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('사용자 ID가 없습니다.');
        return;
      }
      
      const response = await getPetList(userId);
      if (response) {
        // API 응답 데이터를 컴포넌트에서 사용할 형식으로 변환
        const pets = response.map(pet => ({
          petId: pet.petId,
          name: pet.petName,
          species: pet.animalType === 'dog' ? '개' : pet.animalType === 'cat' ? '고양이' : pet.animalType,
          breed: pet.breed || '미상',
          age: pet.age,
          gender: pet.gender === 'M' ? '수컷' : '암컷',
          weight: pet.weight,
          imageUrl: getPetImageUrl(pet.renameFilename)
        }));
        setUserPets(pets);
      }
    } catch (err) {
      console.error('Error loading pets:', err);
      // 에러가 발생해도 UI는 정상 작동하도록 빈 배열 설정
      setUserPets([]);
    }
  };

  // 수의사 일정 로드
  const loadVetSchedules = async (vetId, date) => {
    try {
      const response = await vetScheduleApi.getAvailableSchedules(
        vetId,
        date,
        date
      );
      if (response.success) {
        setVetSchedules(response.data);
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  const consultationTypes = [
    { value: 'VIDEO', label: '화상 상담', price: 30000, displayPrice: '30,000원' },
    { value: 'CHAT', label: '채팅 상담', price: 15000, displayPrice: '15,000원' },
    { value: 'PHONE', label: '전화 상담', price: 20000, displayPrice: '20,000원' }
  ];

  const handleExpertSelect = async (expert) => {
    try {
      console.log('Selected expert:', expert);
      // 전문가 상세 정보 로드 - vet.vetId 사용
      const vetId = expert.vet?.vetId || expert.vetId;
      console.log('VetId:', vetId);
      
      const response = await vetProfileApi.getVetDetail(vetId);
      console.log('VetDetail response:', response);
      
      if (response && response.data) {
        setSelectedExpert(response.data.data || response.data);
        setShowBookingForm(true);
      }
    } catch (err) {
      console.error('Error selecting expert:', err);
      alert('전문가 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleBooking = async () => {
    if (!consultationType || !selectedDate || !selectedSchedule || !symptoms || !selectedPet) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    // 로그인 체크
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    // 결제 모달 표시
    setShowPaymentModal(true);
  };

  // 결제 완료 후 상담 예약 처리
  const handlePaymentComplete = async () => {
    setLoading(true);
    try {
      // 일정 예약
      await vetScheduleApi.bookSchedule(selectedSchedule.scheduleId);

      // 상담실 생성
      const consultationData = {
        vetId: selectedExpert.vetId,
        petId: selectedPet.petId,
        scheduleId: selectedSchedule.scheduleId,
        consultationType: consultationType,
        consultationFee: consultationTypes.find(t => t.value === consultationType)?.price,
        chiefComplaint: symptoms,
        paymentStatus: 'PAID'
      };

      const response = await consultationRoomApi.createConsultation(consultationData);
      
      if (response.success) {
        alert('상담 예약이 완료되었습니다!');
        // 상담 내역 페이지로 이동
        navigate('/mypage/consultations');
      }
    } catch (err) {
      alert('상담 예약에 실패했습니다.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
      setShowPaymentModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setShowBookingForm(false);
    setSelectedExpert(null);
    setConsultationType('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedSchedule(null);
    setSymptoms('');
    setSelectedPet(null);
  };

  return (
    <div className={styles.container}>
      {!showBookingForm ? (
        <div className={styles.expertsSection}>
          <h2 className={styles.sectionTitle}>전문가 선택</h2>
          
          {/* 필터 및 정렬 컨트롤 */}
          <div className={styles.filterSection}>
            <button 
              className={styles.refreshButton}
              onClick={() => {
                console.log('전문가 목록 새로고침');
                loadExperts();
              }}
              title="목록 새로고침"
            >
              🔄 새로고침
            </button>
            
            <div className={styles.filterGroup}>
              <label>전문 분야:</label>
              <select 
                value={filterSpecialty} 
                onChange={(e) => {
                  setFilterSpecialty(e.target.value);
                  setCurrentPage(1); // 필터 변경 시 첫 페이지로
                }}
              >
                <option value="">전체</option>
                <option value="내과">내과</option>
                <option value="외과">외과</option>
                <option value="안과">안과</option>
                <option value="피부과">피부과</option>
                <option value="치과">치과</option>
                <option value="정형외과">정형외과</option>
                <option value="영상의학과">영상의학과</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>정렬:</label>
              <select 
                value={sortBy} 
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="createdAt,desc">최신순</option>
                <option value="ratingAvg,desc">평점 높은순</option>
                <option value="ratingAvg,asc">평점 낮은순</option>
                <option value="consultationCount,desc">상담 많은순</option>
                <option value="consultationCount,asc">상담 적은순</option>
                <option value="consultationFee,asc">상담료 낮은순</option>
                <option value="consultationFee,desc">상담료 높은순</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={onlineOnly}
                  onChange={(e) => {
                    setOnlineOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                />
                온라인 상태만 보기
              </label>
            </div>
            
            <div className={styles.filterInfo}>
              총 {totalElements}명의 전문가
            </div>
          </div>
          
          <div className={styles.expertsGrid}>
            {loading ? (
              <Loading />
            ) : experts.length === 0 ? (
              <div className={styles.noData}>현재 상담 가능한 전문가가 없습니다.</div>
            ) : (
              experts.map(expert => {
                console.log('[ExpertConsult] Expert data:', expert);
                console.log('[ExpertConsult] VetProfile ID:', expert.profileId);
                console.log('[ExpertConsult] isOnline value:', expert.isOnline);
                console.log('[ExpertConsult] Vet name:', expert.vet?.name);
                console.log('[ExpertConsult] Has image:', !!expert.vet?.user?.renameFilename);
                return (
                <div key={expert.profileId} className={styles.expertCard}>
                  <div className={styles.expertImage}>
                    {expert.vet?.user?.renameFilename ? (
                      <img src={`${process.env.REACT_APP_API_BASE_URL}/upload/userprofile/${expert.vet.user.renameFilename}`} alt={expert.vet?.name} />
                    ) : (
                      <div className={styles.defaultProfileImage}>
                        <span>{expert.vet?.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.expertInfo}>
                    <div className={styles.expertHeader}>
                      <h3 className={styles.expertName}>{expert.vet?.name || '이름 없음'}</h3>
                      <div className={styles.expertSpecialty}>{expert.vet?.specialization || '전문 분야 없음'}</div>
                      <div className={styles.expertHospital}>{expert.vet?.address || '주소 없음'}</div>
                    </div>
                    
                    <div className={styles.expertBody}>
                      <div className={styles.expertStats}>
                        <div className={styles.statItem}>
                          <div className={styles.statLabel}>평점</div>
                          <div className={styles.statValue}>⭐ {expert.ratingAvg || 0}</div>
                        </div>
                        <div className={styles.statItem}>
                          <div className={styles.statLabel}>상담횟수</div>
                          <div className={styles.statValue}>{expert.consultationCount}회</div>
                        </div>
                        <div className={styles.statItem}>
                          <div className={styles.statLabel}>상담료</div>
                          <div className={styles.statValue}>{expert.consultationFee?.toLocaleString()}원</div>
                        </div>
                      </div>
                      <p className={styles.expertIntroduction}>{expert.introduction || '상담을 통해 반려동물의 건강을 지키겠습니다.'}</p>
                    </div>
                    
                    <div className={styles.expertFooter}>
                      <div className={styles.expertStatus}>
                        {expert.isOnline === 'Y' ? (
                          <span className={styles.online}>🟢 온라인</span>
                        ) : (
                          <span className={styles.offline}>⚫ 오프라인</span>
                        )}
                      </div>
                      <button className={styles.selectButton} onClick={() => handleExpertSelect(expert)}>
                        선택하기
                      </button>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <PagingView
                currentPage={currentPage}
                totalPage={totalPages}
                startPage={Math.floor((currentPage - 1) / 10) * 10 + 1}
                endPage={Math.min(Math.floor((currentPage - 1) / 10) * 10 + 10, totalPages)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className={styles.bookingSection}>
          <div className={styles.bookingHeader}>
            <button className={styles.backButton} onClick={() => setShowBookingForm(false)}>
              ← 전문가 선택으로 돌아가기
            </button>
            <h2 className={styles.bookingTitle}>상담 예약</h2>
          </div>

          <div className={styles.selectedExpertInfo}>
            <div className={styles.selectedExpertImage}>
              {selectedExpert.vet?.user?.renameFilename ? (
                <img src={`${process.env.REACT_APP_API_BASE_URL}/upload/userprofile/${selectedExpert.vet.user.renameFilename}`} alt={selectedExpert.vet?.name} />
              ) : (
                <div className={styles.defaultProfileImageSmall}>
                  <span>{selectedExpert.vet?.name?.charAt(0) || '?'}</span>
                </div>
              )}
            </div>
            <div className={styles.expertDetails}>
              <h3 className={styles.expertName}>{selectedExpert.vet?.name || '이름 없음'}</h3>
              <div className={styles.expertSpecialty}>{selectedExpert.vet?.specialization || '전문 분야 없음'}</div>
              <div className={styles.expertHospital}>{selectedExpert.vet?.address || '주소 없음'}</div>
            </div>
          </div>

          <div className={styles.bookingForm}>
            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>1. 상담 방식 선택</h3>
              <div className={styles.consultationTypeGrid}>
                {consultationTypes.map(type => (
                  <div 
                    key={type.value}
                    className={`${styles.typeCard} ${consultationType === type.value ? styles.selected : ''}`}
                    onClick={() => setConsultationType(type.value)}
                  >
                    <div className={styles.typeLabel}>{type.label}</div>
                    <div className={styles.typePrice}>{type.displayPrice}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>2. 날짜 및 시간 선택</h3>
              <div className={styles.dateTimeGrid}>
                <div className={styles.dateInput}>
                  <label>날짜</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.timeSelect}>
                  <label>시간</label>
                  <select 
                    value={selectedSchedule?.scheduleId || ''}
                    onChange={(e) => {
                      const schedule = vetSchedules.find(s => s.scheduleId === Number(e.target.value));
                      setSelectedSchedule(schedule);
                      setSelectedTime(schedule ? `${schedule.startTime} - ${schedule.endTime}` : '');
                    }}
                  >
                    <option value="">시간 선택</option>
                    {vetSchedules.map(schedule => (
                      <option key={schedule.scheduleId} value={schedule.scheduleId}>
                        {schedule.startTime} - {schedule.endTime} (예약 가능: {schedule.maxConsultations - schedule.currentBookings}명)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>3. 반려동물 선택</h3>
              <div className={styles.petSelect}>
                {userPets.length === 0 ? (
                  <div className={styles.noPetsMessage}>
                    <p>등록된 반려동물이 없습니다.</p>
                    <button 
                      className={styles.registerPetButton}
                      onClick={() => navigate('/mypage/pet-register')}
                    >
                      반려동물 등록하기
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedPet?.petId || ''}
                    onChange={(e) => {
                      const pet = userPets.find(p => p.petId === Number(e.target.value));
                      setSelectedPet(pet);
                    }}
                  >
                    <option value="">반려동물을 선택하세요</option>
                    {userPets.map(pet => (
                      <option key={pet.petId} value={pet.petId}>
                        {pet.name} ({pet.species} - {pet.breed}, {pet.age}살, {pet.gender})
                      </option>
                    ))}
                  </select>
                )}
                
                {selectedPet && (
                  <div className={styles.selectedPetInfo}>
                    <div className={styles.petImageWrapper}>
                      {selectedPet.imageUrl ? (
                        <img 
                          src={selectedPet.imageUrl} 
                          alt={selectedPet.name}
                          className={styles.petImage}
                        />
                      ) : (
                        <div className={styles.petImagePlaceholder}>
                          {selectedPet.species === '개' ? '🐕' : '🐈'}
                        </div>
                      )}
                    </div>
                    <div className={styles.petDetails}>
                      <h4>{selectedPet.name}</h4>
                      <p>{selectedPet.species} - {selectedPet.breed}</p>
                      <p>{selectedPet.age}살, {selectedPet.gender}, {selectedPet.weight}kg</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>4. 증상 및 상담 내용</h3>
              <textarea 
                className={styles.textArea}
                placeholder="반려동물의 증상이나 상담하고 싶은 내용을 자세히 적어주세요..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={5}
              />
            </div>

            <button className={styles.bookingButton} onClick={handleBooking}>
              상담 예약하기
            </button>
          </div>
        </div>
      )}

      {/* 결제 모달 */}
      {showPaymentModal && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="결제 확인"
        >
          <div className={styles.paymentModal}>
            <div className={styles.paymentInfo}>
              <h4>상담 정보</h4>
              <p>전문가: {selectedExpert?.vetName}</p>
              <p>일시: {selectedDate} {selectedTime}</p>
              <p>상담 방식: {consultationTypes.find(t => t.value === consultationType)?.label}</p>
              <p>반려동물: {selectedPet?.name}</p>
              <p className={styles.paymentAmount}>
                결제 금액: {consultationTypes.find(t => t.value === consultationType)?.displayPrice}
              </p>
            </div>
            <div className={styles.paymentButtons}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowPaymentModal(false)}
              >
                취소
              </button>
              <button 
                className={styles.confirmButton}
                onClick={handlePaymentComplete}
                disabled={loading}
              >
                {loading ? '처리중...' : '결제하기'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>상담 안내</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🎥</div>
            <h3 className={styles.infoCardTitle}>화상 상담</h3>
            <div className={styles.infoCardText}>
              • 실시간 화상 통화<br/>
              • 반려동물 직접 확인 가능<br/>
              • 30분 상담<br/>
              • 상담료: 30,000원
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>💬</div>
            <h3 className={styles.infoCardTitle}>채팅 상담</h3>
            <div className={styles.infoCardText}>
              • 실시간 텍스트 대화<br/>
              • 사진/동영상 전송 가능<br/>
              • 24시간 기록 보관<br/>
              • 상담료: 15,000원
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📞</div>
            <h3 className={styles.infoCardTitle}>전화 상담</h3>
            <div className={styles.infoCardText}>
              • 음성 통화 상담<br/>
              • 빠른 응답 가능<br/>
              • 20분 상담<br/>
              • 상담료: 20,000원
            </div>
          </div>
        </div>
      </div>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>자주 묻는 질문</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>Q. 상담 시간은 얼마나 되나요?</div>
            <div className={styles.faqAnswer}>A. 화상 상담 30분, 전화 상담 20분, 채팅 상담은 실시간 응답으로 진행됩니다.</div>
          </div>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>Q. 응급상황일 때도 이용할 수 있나요?</div>
            <div className={styles.faqAnswer}>A. 응급상황의 경우 즉시 가까운 동물병원에 내원하시기 바랍니다.</div>
          </div>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>Q. 상담료 결제는 어떻게 하나요?</div>
            <div className={styles.faqAnswer}>A. 신용카드, 계좌이체, 간편결제 등 다양한 결제 수단을 지원합니다.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertConsult;
