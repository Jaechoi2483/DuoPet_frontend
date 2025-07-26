// src/pages/health/ExpertConsult.js (전체 수정 코드)
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExpertConsult.module.css';
import { vetProfileApi, consultationRoomApi, vetScheduleApi } from '../../api/consultationApi';
import { getPetList, getPetImageUrl } from '../../api/petApi';
import Loading from '../../components/common/Loading';
import PagingView from '../../components/common/pagingView';
import DatePicker from '../../components/consultation/DatePicker';
import TimeSlotPicker from '../../components/consultation/TimeSlotPicker';
import BookingConfirmModal from '../../components/consultation/BookingConfirmModal';
import InstantConsultModal from '../../components/consultation/InstantConsultModal';
import { AuthContext } from '../../AuthProvider';

const ExpertConsult = () => {
  const navigate = useNavigate();
  // 💡 [수정] AuthContext는 authInfo의 속성들을 직접 제공
  const authContext = useContext(AuthContext) || {};
  const { 
    isLoggedIn = false, 
    role = '', 
    username = '', 
    userid = '', 
    userNo = null,
    isAuthLoading = false 
  } = authContext;
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [consultationType, setConsultationType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(''); // eslint-disable-line no-unused-vars
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [experts, setExperts] = useState([]);
  const [vetSchedules, setVetSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // eslint-disable-line no-unused-vars
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [userPets, setUserPets] = useState([]);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantConsultData, setInstantConsultData] = useState(null); // eslint-disable-line no-unused-vars

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
  }, [currentPage, filterSpecialty, sortBy, onlineOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // 인증 정보가 로드되면 반려동물 목록 로드
  useEffect(() => {
    if (!isAuthLoading && userNo) {
      loadUserPets();
    }
  }, [userNo, isAuthLoading]);

  // 선택한 날짜가 변경되면 해당 날짜의 일정 로드
  useEffect(() => {
    if (selectedExpert && selectedDate) {
      const vetId = selectedExpert.vet?.vetId || selectedExpert.profileId;
      if (vetId) {
        console.log('Loading schedules for vetId:', vetId, 'date:', selectedDate);
        loadVetSchedules(vetId, selectedDate);
      }
    }
  }, [selectedDate, selectedExpert]);

  // 전문가 목록 로드
  const loadExperts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vetProfileApi.getAllAvailable(
        currentPage - 1,
        6,
        sortBy,
        filterSpecialty || null,
        onlineOnly || null
      );
      if (response && response.data) {
        const pageData = response.data;
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
      if (!userNo) {
        return;
      }
      const response = await getPetList(userNo);
      if (response && response.length > 0) {
        const pets = response.map((pet) => ({
          petId: pet.petId,
          name: pet.petName,
          species: pet.animalType,
          breed: pet.breed || '미상',
          age: pet.age,
          gender: pet.gender === 'M' ? '수컷' : '암컷',
          weight: pet.weight,
          imageUrl: getPetImageUrl(pet.renameFilename),
        }));
        setUserPets(pets);
      } else {
        setUserPets([]);
      }
    } catch (err) {
      console.error('Error loading pets:', err);
      if (err.response?.status !== 404) {
        // 404(펫 없음)가 아닌 경우에만 에러 처리
      }
      setUserPets([]);
    }
  };

  // 수의사 일정 로드
  const loadVetSchedules = async (vetId, date) => {
    try {
      const response = await vetScheduleApi.getAvailableSchedules(vetId, date, date);
      if (response.success) {
        setVetSchedules(response.data);
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  // 💡 [수정됨] 즉시 상담 요청 처리 (유일한 함수)
  // InstantConsultModal의 onConfirm prop으로 전달됩니다.
  const handleInstantConsultRequest = async (petId, symptoms) => {
    if (!isLoggedIn || !selectedExpert) {
      alert('로그인 정보 또는 전문가 정보가 없습니다.');
      return;
    }

    // 전문가 역할 사용자는 신청 불가
    if (role === 'VET') {
      alert('전문가는 상담을 신청할 수 없습니다. 일반 사용자로 로그인해주세요.');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        userId: userNo, // 로그인된 사용자의 고유 ID
        vetId: selectedExpert.vet.vetId, // 선택된 전문가의 vetId
        petId: petId,
        consultationType: 'CHAT', // 즉시상담은 채팅으로 고정
        chiefComplaint: symptoms,
      };

      console.log('상담 요청 데이터:', requestData);
      // 상담방 생성 API 호출
      // 💡 API 통일: 예약/즉시 모두 createConsultation 사용 (백엔드와 협의 필요)
      // 만약 즉시상담 API가 다르다면 consultationRoomApi.createInstantConsultation 사용
      const response = await consultationRoomApi.createConsultation(requestData);

      if (response.success && response.data && response.data.roomUuid) {
        const { roomUuid } = response.data;
        console.log('상담방 생성 성공, UUID:', roomUuid);
        // 상담 대기 페이지로 이동
        navigate(`/consultation/waiting/${roomUuid}`);
      } else {
        console.error('예상치 못한 응답 구조:', response);
        alert('상담 요청에 실패했습니다: ' + (response.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('상담 요청 중 오류 발생:', error);
      alert('상담 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setShowInstantModal(false);
    }
  };

  const consultationTypes = [
    { value: 'VIDEO', label: '화상 상담', price: 30000, displayPrice: '30,000원' },
    { value: 'CHAT', label: '채팅 상담', price: 15000, displayPrice: '15,000원' },
    { value: 'PHONE', label: '전화 상담', price: 20000, displayPrice: '20,000원' },
  ];

  const handleExpertSelect = async (expert) => {
    try {
      console.log('Selected expert:', expert);
      setSelectedExpert(expert);
      setShowBookingForm(true);

      setTimeout(() => {
        const bookingSection = document.querySelector(`.${styles.bookingSection}`);
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Error selecting expert:', err);
      alert('전문가 선택 중 오류가 발생했습니다.');
    }
  };

  const handleBooking = async () => {
    if (!consultationType || !selectedDate || !selectedSchedule || !symptoms || !selectedPet) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    setShowPaymentModal(true);
  };

  // 더미 스케줄 생성 (개발용)
  const generateDummySchedules = async () => {
    if (!selectedExpert) {
      alert('먼저 전문가를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const vetId = selectedExpert.profileId || selectedExpert.vetId;

      const schedules = [];
      const today = new Date();

      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + day);
        const dateStr = currentDate.toISOString().split('T')[0];

        for (let hour = 9; hour < 12; hour++) {
          schedules.push({
            vetId,
            date: dateStr,
            startTime: `${String(hour).padStart(2, '0')}:00`,
            endTime: `${String(hour).padStart(2, '0')}:30`,
            slotDurationMinutes: 30,
          });
          schedules.push({
            vetId,
            date: dateStr,
            startTime: `${String(hour).padStart(2, '0')}:30`,
            endTime: `${String(hour + 1).padStart(2, '0')}:00`,
            slotDurationMinutes: 30,
          });
        }
        for (let hour = 14; hour < 18; hour++) {
          schedules.push({
            vetId,
            date: dateStr,
            startTime: `${String(hour).padStart(2, '0')}:00`,
            endTime: `${String(hour).padStart(2, '0')}:30`,
            slotDurationMinutes: 30,
          });
          schedules.push({
            vetId,
            date: dateStr,
            startTime: `${String(hour).padStart(2, '0')}:30`,
            endTime: `${String(hour + 1).padStart(2, '0')}:00`,
            slotDurationMinutes: 30,
          });
        }
      }

      console.log('Creating dummy schedules:', schedules.length);
      for (const schedule of schedules) {
        await vetScheduleApi.createScheduleBatch(schedule);
      }

      alert(`${schedules.length}개의 스케줄이 생성되었습니다!`);

      if (selectedDate) {
        await loadVetSchedules(vetId, selectedDate);
      }
    } catch (err) {
      console.error('Error creating dummy schedules:', err);
      alert('스케줄 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 결제 완료 후 상담 예약 처리
  const handlePaymentComplete = async () => {
    setLoading(true);
    try {
      await vetScheduleApi.bookSchedule(selectedSchedule.scheduleId);

      const vetId = selectedExpert.vetId || selectedExpert.vet?.vetId;
      const consultationData = {
        // 💡 [수정됨] AuthContext에서 가져온 userNo를 사용합니다.
        userId: userNo,
        vetId: vetId,
        petId: selectedPet.petId,
        scheduleId: selectedSchedule.scheduleId,
        consultationType: consultationType.toUpperCase(),
        chiefComplaint: symptoms,
      };

      const response = await consultationRoomApi.createConsultation(consultationData);

      if (response.success) {
        alert('상담 예약이 완료되었습니다!');
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

  // 즉시 상담 모달 열기 핸들러
  const handleInstantConsultation = (expert) => {
    console.log('handleInstantConsultation - isLoggedIn:', isLoggedIn);
    console.log('handleInstantConsultation - userNo:', userNo);
    console.log('handleInstantConsultation - role:', role);
    
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    if (userPets.length === 0) {
      alert('먼저 반려동물을 등록해주세요.');
      navigate('/mypage/pet/register');
      return;
    }

    setSelectedExpert(expert);
    setInstantConsultData({ expert });
    setShowInstantModal(true);
  };

  // 💡 [삭제됨] 이전에 중복으로 존재하던 두 번째 handleInstantConsultRequest 함수를 제거했습니다.

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

            <div className={styles.filterInfo}>총 {totalElements}명의 전문가</div>
          </div>

          <div className={styles.expertsGrid}>
            {loading ? (
              <Loading />
            ) : experts.length === 0 ? (
              <div className={styles.noData}>현재 상담 가능한 전문가가 없습니다.</div>
            ) : (
              experts.map((expert) => (
                <div key={expert.profileId} className={styles.expertCard}>
                  <div className={styles.expertImage}>
                    {expert.vet?.user?.renameFilename ? (
                      <img
                        src={`${process.env.REACT_APP_API_BASE_URL}/upload/userprofile/${expert.vet.user.renameFilename}`}
                        alt={expert.vet?.name}
                      />
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
                      <p className={styles.expertIntroduction}>
                        {expert.introduction || '상담을 통해 반려동물의 건강을 지키겠습니다.'}
                      </p>
                    </div>

                    <div className={styles.expertFooter}>
                      <div className={styles.expertStatus}>
                        {expert.isOnline === 'Y' ? (
                          <span className={styles.online}>🟢 온라인</span>
                        ) : (
                          <span className={styles.offline}>⚫ 오프라인</span>
                        )}
                      </div>
                      <div className={styles.expertActions}>
                        <button className={styles.selectButton} onClick={() => handleExpertSelect(expert)}>
                          예약 상담
                        </button>
                        {expert.isOnline === 'Y' && (
                          <button className={styles.instantButton} onClick={() => handleInstantConsultation(expert)}>
                            즉시 상담
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL}/upload/userprofile/${selectedExpert.vet.user.renameFilename}`}
                  alt={selectedExpert.vet?.name}
                />
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

          {/* 개발 환경에서만 표시되는 더미 데이터 생성 버튼 */}
          {process.env.NODE_ENV === 'development' && (
            <div className={styles.devTools}>
              <button className={styles.generateScheduleButton} onClick={generateDummySchedules} disabled={loading}>
                {loading ? '생성 중...' : '테스트용 스케줄 생성 (7일)'}
              </button>
              <p className={styles.devToolsInfo}>* 개발 환경 전용: 향후 7일간의 상담 스케줄을 자동 생성합니다.</p>
            </div>
          )}

          <div className={styles.bookingForm}>
            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>1. 상담 방식 선택</h3>
              <div className={styles.consultationTypeGrid}>
                {consultationTypes.map((type) => (
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
              <div className={styles.dateTimeSection}>
                <div className={styles.datePickerWrapper}>
                  <DatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate} minDate={new Date()} />
                </div>
                {selectedDate && (
                  <div className={styles.timeSlotWrapper}>
                    <TimeSlotPicker
                      availableSlots={vetSchedules}
                      selectedSlot={selectedSchedule}
                      onSlotSelect={(slot) => {
                        setSelectedSchedule(slot);
                        setSelectedTime(slot ? `${slot.startTime} - ${slot.endTime}` : '');
                      }}
                      isLoading={loading}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>3. 반려동물 선택</h3>
              <div className={styles.petSelect}>
                {userPets.length === 0 ? (
                  <div className={styles.noPetsMessage}>
                    <p>등록된 반려동물이 없습니다.</p>
                    <button className={styles.registerPetButton} onClick={() => navigate('/mypage/pet/register')}>
                      반려동물 등록하기
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedPet?.petId || ''}
                      onChange={(e) => {
                        const pet = userPets.find((p) => p.petId === Number(e.target.value));
                        setSelectedPet(pet);
                      }}
                    >
                      <option value="">반려동물을 선택하세요</option>
                      {userPets.map((pet) => (
                        <option key={pet.petId} value={pet.petId}>
                          {pet.name} ({pet.species} - {pet.breed}, {pet.age}살, {pet.gender})
                        </option>
                      ))}
                    </select>
                    <div className={styles.petManagementActions}>
                      <button className={styles.addPetButton} onClick={() => navigate('/mypage/pet/register')}>
                        + 반려동물 추가 등록
                      </button>
                    </div>
                  </>
                )}

                {selectedPet && (
                  <div className={styles.selectedPetInfo}>
                    <div className={styles.petImageWrapper}>
                      {selectedPet.imageUrl ? (
                        <img src={selectedPet.imageUrl} alt={selectedPet.name} className={styles.petImage} />
                      ) : (
                        <div className={styles.petImagePlaceholder}>{selectedPet.species === '개' ? '🐕' : '🐈'}</div>
                      )}
                    </div>
                    <div className={styles.petDetails}>
                      <h4>{selectedPet.name}</h4>
                      <p>
                        {selectedPet.species} - {selectedPet.breed}
                      </p>
                      <p>
                        {selectedPet.age}살, {selectedPet.gender}, {selectedPet.weight}kg
                      </p>
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

            <div className={styles.formActions}>
              <button
                className={styles.bookingButton}
                onClick={handleBooking}
                disabled={!consultationType || !selectedDate || !selectedSchedule || !selectedPet}
              >
                {!consultationType && '상담 방식을 선택해주세요'}
                {consultationType && !selectedDate && '날짜를 선택해주세요'}
                {consultationType && selectedDate && !selectedSchedule && '시간을 선택해주세요'}
                {consultationType && selectedDate && selectedSchedule && !selectedPet && '반려동물을 선택해주세요'}
                {consultationType && selectedDate && selectedSchedule && selectedPet && '상담 예약하기'}
              </button>
              {consultationType && selectedDate && selectedSchedule && selectedPet && (
                <p className={styles.formHelperText}>모든 정보가 입력되었습니다. 예약하기를 클릭해주세요.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 결제 모달 */}
      <BookingConfirmModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentComplete}
        bookingData={
          showPaymentModal
            ? {
                expert: {
                  vetName: selectedExpert?.vet?.name || '이름 없음',
                  hospitalName: selectedExpert?.vet?.address || '병원 정보 없음',
                  specialties: selectedExpert?.vet?.specialization ? [selectedExpert.vet.specialization] : [],
                  rating: selectedExpert?.rating || 0,
                  consultationCount: selectedExpert?.consultationCount || 0,
                  profileImageUrl: selectedExpert?.vet?.user?.renameFilename
                    ? `${process.env.REACT_APP_API_BASE_URL}/upload/userprofile/${selectedExpert.vet.user.renameFilename}`
                    : null,
                },
                consultationType,
                date: selectedDate,
                schedule: selectedSchedule,
                pet: selectedPet,
                symptoms,
                consultationFee: consultationTypes.find((t) => t.value === consultationType)?.price || 0,
              }
            : null
        }
        isProcessing={loading}
      />

      {/* 즉시 상담 모달 */}
      <InstantConsultModal
        isOpen={showInstantModal}
        onClose={() => setShowInstantModal(false)}
        expert={selectedExpert}
        userPets={userPets}
        onConfirm={handleInstantConsultRequest} // 수정된 유일한 함수를 전달
        isLoading={loading}
      />

      {/* ... 이하 FAQ 등 나머지 JSX 코드는 그대로 유지 ... */}
      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>상담 안내</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🎥</div>
            <h3 className={styles.infoCardTitle}>화상 상담</h3>
            <div className={styles.infoCardText}>
              • 실시간 화상 통화
              <br />
              • 반려동물 직접 확인 가능
              <br />
              • 30분 상담
              <br />• 상담료: 30,000원
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>💬</div>
            <h3 className={styles.infoCardTitle}>채팅 상담</h3>
            <div className={styles.infoCardText}>
              • 실시간 텍스트 대화
              <br />
              • 사진/동영상 전송 가능
              <br />
              • 24시간 기록 보관
              <br />• 상담료: 15,000원
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📞</div>
            <h3 className={styles.infoCardTitle}>전화 상담</h3>
            <div className={styles.infoCardText}>
              • 음성 통화 상담
              <br />
              • 빠른 응답 가능
              <br />
              • 20분 상담
              <br />• 상담료: 20,000원
            </div>
          </div>
        </div>
      </div>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>자주 묻는 질문</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>Q. 상담 시간은 얼마나 되나요?</div>
            <div className={styles.faqAnswer}>
              A. 화상 상담 30분, 전화 상담 20분, 채팅 상담은 실시간 응답으로 진행됩니다.
            </div>
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
