// src/pages/health/HealthMain.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './HealthMain.module.css';
import HealthRecords from './HealthRecords';
import AiDiagnosis from './AiDiagnosis';
import AiBehavior from './AiBehavior';
import ExpertConsult from './ExpertConsult';
import PetInfoDisplay from '../../components/pet/PetInfoDisplay';
import { useContext } from 'react';
import { AuthContext } from '../../AuthProvider';

const HealthMain = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('health-records');
  const [userId, setUserId] = useState(null);
  // AuthContext에서 직접 값들을 가져옴
  const { isLoggedIn, userNo, isAuthLoading } = useContext(AuthContext) || {};

  // 사용자 ID 가져오기 (로그인 정보에서)
  useEffect(() => {
    console.log('HealthMain - isLoggedIn:', isLoggedIn);
    console.log('HealthMain - userNo:', userNo);
    console.log('HealthMain - isAuthLoading:', isAuthLoading);
    
    // AuthContext에서 사용자 정보 가져오기
    if (isLoggedIn && userNo) {
      console.log('Using userNo from context:', userNo);
      setUserId(userNo);
    } else if (!isAuthLoading) {
      // 로컬 스토리지에서 userId 찾기 (회원가입 시 저장됨)
      const storedUserId = localStorage.getItem('userId');
      console.log('StoredUserId from localStorage:', storedUserId);
      if (storedUserId) {
        setUserId(Number(storedUserId));
      }
    }
  }, [isLoggedIn, userNo, isAuthLoading]);

  // URL 기반으로 활성 탭 결정
  useEffect(() => {
    const path = location.pathname;
    if (path === '/health/ai-diagnosis') {
      setActiveMainTab('ai-diagnosis');
    } else if (path === '/health/ai-behavior') {
      setActiveMainTab('ai-behavior');
    } else if (path === '/health/expert-consult') {
      setActiveMainTab('expert-consult');
    } else {
      setActiveMainTab('health-records');
    }
  }, [location.pathname]);

  // 탭 변경 시 URL도 변경
  const handleTabChange = (tabId) => {
    setActiveMainTab(tabId);
    
    switch (tabId) {
      case 'health-records':
        navigate('/health');
        break;
      case 'ai-diagnosis':
        navigate('/health/ai-diagnosis');
        break;
      case 'ai-behavior':
        navigate('/health/ai-behavior');
        break;
      case 'expert-consult':
        navigate('/health/expert-consult');
        break;
      default:
        navigate('/health');
    }
  };

  const mainTabs = [
    { id: 'health-records', label: '건강 기록' },
    { id: 'ai-diagnosis', label: 'AI 진단' },
    { id: 'ai-behavior', label: 'AI 행동분석' },
    { id: 'expert-consult', label: '전문가 상담' },
  ];

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
  };

  const renderMainTabContent = () => {
    switch (activeMainTab) {
      case 'health-records':
        return <HealthRecords pet={selectedPet} />;
      case 'ai-diagnosis':
        return <AiDiagnosis pet={selectedPet} />;
      case 'ai-behavior':
        return <AiBehavior pet={selectedPet} />;
      case 'expert-consult':
        return <ExpertConsult pet={selectedPet} />;
      default:
        return <HealthRecords pet={selectedPet} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>❤️</div>
          <div className={styles.headerText}>
            <h1 className={styles.title}>건강 관리</h1>
            <p className={styles.subtitle}>
              소중한 반려동물의 건강을 체계적으로 관리해보세요
            </p>
          </div>
        </div>
      </div>

      <div className={styles.mainTabsContainer}>
        <div className={styles.mainTabsList}>
          {mainTabs.map((tab) => (
            <div key={tab.id} className={styles.mainTabItem}>
              <button
                className={`${styles.mainTabButton} ${activeMainTab === tab.id ? styles.active : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.petSection}>
        <h2 className={styles.sectionTitle}>반려동물 선택</h2>
        {isAuthLoading ? (
          <div className={styles.loading}>인증 정보를 확인 중입니다...</div>
        ) : userId ? (
          <PetInfoDisplay 
            userId={userId} 
            onPetSelect={handlePetSelect}
          />
        ) : (
          <div className={styles.emptyState}>
            로그인 후 이용해주세요.
          </div>
        )}
      </div>

      {renderMainTabContent()}
    </div>
  );
};

export default HealthMain;
