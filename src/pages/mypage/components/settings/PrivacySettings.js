import React, { useState } from 'react';
import styles from './PrivacySettings.module.css';

const PrivacySettings = ({ onBack }) => {
  const [privacySettings, setPrivacySettings] = useState({
    // 프로필 공개 설정
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showPhone: false,
    showPets: true,
    
    // 활동 공개 설정
    showActivity: true,
    showBookmarks: false,
    showConsultations: false,
    
    // 데이터 수집
    analyticsConsent: true,
    personalizationConsent: true,
    thirdPartyConsent: false
  });

  const handleRadioChange = (name, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = () => {
    // 실제로는 API 호출하여 설정 저장
    console.log('개인정보 설정 저장:', privacySettings);
    alert('개인정보 보호 설정이 저장되었습니다.');
  };

  const handleDataDownload = () => {
    // 실제로는 개인정보 다운로드 요청
    alert('개인정보 다운로드를 요청했습니다. 등록된 이메일로 다운로드 링크가 전송됩니다.');
  };

  return (
    <div className={styles.privacySettingsContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2 className={styles.title}>개인정보 보호</h2>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>프로필 공개 범위</h3>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="profileVisibility"
                value="public"
                checked={privacySettings.profileVisibility === 'public'}
                onChange={(e) => handleRadioChange('profileVisibility', e.target.value)}
              />
              <span className={styles.radioText}>
                <strong>전체 공개</strong>
                <span className={styles.radioDesc}>모든 사용자가 프로필을 볼 수 있습니다</span>
              </span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="profileVisibility"
                value="friends"
                checked={privacySettings.profileVisibility === 'friends'}
                onChange={(e) => handleRadioChange('profileVisibility', e.target.value)}
              />
              <span className={styles.radioText}>
                <strong>팔로워만</strong>
                <span className={styles.radioDesc}>팔로워만 프로필을 볼 수 있습니다</span>
              </span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="profileVisibility"
                value="private"
                checked={privacySettings.profileVisibility === 'private'}
                onChange={(e) => handleRadioChange('profileVisibility', e.target.value)}
              />
              <span className={styles.radioText}>
                <strong>비공개</strong>
                <span className={styles.radioDesc}>아무도 프로필을 볼 수 없습니다</span>
              </span>
            </label>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>프로필 정보 공개</h3>
          <div className={styles.toggleGroup}>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>이메일 주소</span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.showEmail}
                  onChange={() => handleToggle('showEmail')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>전화번호</span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.showPhone}
                  onChange={() => handleToggle('showPhone')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>반려동물 정보</span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.showPets}
                  onChange={() => handleToggle('showPets')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>활동 내역 공개</h3>
          <div className={styles.toggleGroup}>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>작성한 게시글</span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.showActivity}
                  onChange={() => handleToggle('showActivity')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>북마크</span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.showBookmarks}
                  onChange={() => handleToggle('showBookmarks')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>상담 내역</span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.showConsultations}
                  onChange={() => handleToggle('showConsultations')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>데이터 수집 및 활용</h3>
          <div className={styles.toggleGroup}>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>서비스 개선을 위한 데이터 수집</span>
                <span className={styles.toggleDesc}>
                  서비스 이용 패턴 분석 및 개선에 활용됩니다
                </span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.analyticsConsent}
                  onChange={() => handleToggle('analyticsConsent')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>맞춤형 콘텐츠 제공</span>
                <span className={styles.toggleDesc}>
                  관심사 기반 맞춤 콘텐츠 추천에 활용됩니다
                </span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.personalizationConsent}
                  onChange={() => handleToggle('personalizationConsent')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>제3자 제공 동의</span>
                <span className={styles.toggleDesc}>
                  파트너사 서비스 연동 시 필요한 정보를 제공합니다
                </span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={privacySettings.thirdPartyConsent}
                  onChange={() => handleToggle('thirdPartyConsent')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.dataManagement}>
          <h3 className={styles.sectionTitle}>개인정보 관리</h3>
          <button 
            className={styles.dataButton}
            onClick={handleDataDownload}
          >
            내 정보 다운로드
          </button>
          <p className={styles.dataInfo}>
            회원님의 모든 개인정보를 다운로드할 수 있습니다.
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            className={styles.saveButton}
            onClick={handleSaveSettings}
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;