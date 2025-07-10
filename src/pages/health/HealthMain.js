// src/pages/health/HealthMain.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './HealthMain.module.css';
import HealthRecords from './HealthRecords';
import AiDiagnosis from './AiDiagnosis';
import AiBehavior from './AiBehavior';
import ExpertConsult from './ExpertConsult';

const HealthMain = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState(1);
  const [activeMainTab, setActiveMainTab] = useState('health-records');

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

  const pets = [
    {
      id: 1,
      name: '뽀삐',
      species: '강아지',
      breed: '포메라니안',
      age: 3,
      weight: 2.8,
    },
    {
      id: 2,
      name: '나비',
      species: '고양이',
      breed: '스코티시폴드',
      age: 2,
      weight: 3.2,
    },
  ];

  const mainTabs = [
    { id: 'health-records', label: '건강 기록' },
    { id: 'ai-diagnosis', label: 'AI 진단' },
    { id: 'ai-behavior', label: 'AI 행동분석' },
    { id: 'expert-consult', label: '전문가 상담' },
  ];

  const currentPet = pets.find((pet) => pet.id === selectedPet);

  const renderMainTabContent = () => {
    switch (activeMainTab) {
      case 'health-records':
        return <HealthRecords pet={currentPet} />;
      case 'ai-diagnosis':
        return <AiDiagnosis pet={currentPet} />;
      case 'ai-behavior':
        return <AiBehavior pet={currentPet} />;
      case 'expert-consult':
        return <ExpertConsult pet={currentPet} />;
      default:
        return <HealthRecords pet={currentPet} />;
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
        <div className={styles.petGrid}>
          {pets.map((pet) => (
            <div
              key={pet.id}
              className={`${styles.petCard} ${selectedPet === pet.id ? styles.isSelected : ''}`}
              onClick={() => setSelectedPet(pet.id)}
            >
              <div className={styles.petAvatar}>
                {pet.species === '강아지' ? '🐕' : '🐱'}
              </div>
              <div className={styles.petInfo}>
                <h3 className={styles.petName}>{pet.name}</h3>
                <p className={styles.petBreed}>{pet.breed}</p>
                <p className={styles.petDetails}>
                  {pet.age}세 · {pet.weight}kg
                </p>
              </div>
              {selectedPet === pet.id && (
                <div className={styles.selectedBadge}>선택됨</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {renderMainTabContent()}
    </div>
  );
};

export default HealthMain;
