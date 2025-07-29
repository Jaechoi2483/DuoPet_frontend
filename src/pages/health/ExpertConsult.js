// src/pages/health/ExpertConsult.js (전체 수정 코드)
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExpertConsult.module.css';
import { vetProfileApi, consultationRoomApi } from '../../api/consultationApi';
import { getPetList, getPetImageUrl } from '../../api/petApi';
import Loading from '../../components/common/Loading';
import PagingView from '../../components/common/pagingView';
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
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // eslint-disable-line no-unused-vars
  const [userPets, setUserPets] = useState([]);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState({}); // 상담 상태 맵

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
  
  // 주기적으로 상담 상태 업데이트 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      loadExperts();
    }, 30000); // 30초
    
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 인증 정보가 로드되면 반려동물 목록 로드
  useEffect(() => {
    if (!isAuthLoading && userNo) {
      loadUserPets();
    }
  }, [userNo, isAuthLoading]);


  // 전문가 목록 로드
  const loadExperts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vetProfileApi.getAllAvailableWithStatus(
        currentPage - 1,
        6,
        sortBy
      );
      if (response && response.data) {
        const { vets, consultationStatus: statusMap } = response.data;
        const pageData = vets;
        const expertsData = pageData.content || [];
        setExperts(expertsData);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
        setConsultationStatus(statusMap || {});
      } else {
        setExperts([]);
        setTotalPages(0);
        setTotalElements(0);
        setConsultationStatus({});
      }
    } catch (err) {
      console.error('Error loading experts:', err);
      setError('전문가 목록을 불러오는데 실패했습니다.');
      setExperts([]);
      setConsultationStatus({});
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
    setShowInstantModal(true);
  };

  // Q&A 상담 페이지로 이동
  const handleQnaConsultation = (expert) => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    
    // Q&A 상담 페이지로 이동하면서 전문가 정보 전달
    navigate('/health/qna-consultation', { 
      state: { 
        vetInfo: {
          vetId: expert.vet?.vetId || expert.vetId,
          name: expert.vet?.name || expert.name,
          specialization: expert.vet?.specialization || expert.specialization,
          consultationFee: expert.consultationFee || 30000
        }
      }
    });
  };

  // 💡 [삭제됨] 이전에 중복으로 존재하던 두 번째 handleInstantConsultRequest 함수를 제거했습니다.


  return (
    <div className={styles.container}>
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
                        {consultationStatus[expert.vet?.vetId] ? (
                          <span className={styles.inConsultation}>🔴 상담중</span>
                        ) : expert.isOnline === 'Y' ? (
                          <span className={styles.online}>🟢 온라인</span>
                        ) : (
                          <span className={styles.offline}>⚫ 오프라인</span>
                        )}
                      </div>
                      <div className={styles.expertActions}>
                        {expert.isOnline === 'Y' && !consultationStatus[expert.vet?.vetId] && (
                          <button className={styles.instantButton} onClick={() => handleInstantConsultation(expert)}>
                            즉시 상담
                          </button>
                        )}
                        <button 
                          className={styles.qnaButton} 
                          onClick={() => handleQnaConsultation(expert)}
                        >
                          Q&A 상담
                        </button>
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
