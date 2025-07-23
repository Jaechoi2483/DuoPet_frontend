import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SettingsList.module.css';
import AccountSettings from './AccountSettings';
import PasswordChange from './PasswordChange';
import RoleSettings from './RoleSettings';
import FaceSettings from './FaceSettings';

const SettingsList = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);

  const settingsMenu = [
    {
      id: 'account',
      title: '계정 설정',
      description: '이메일, 전화번호 등 계정 정보를 관리합니다',
      icon: '👤',
      component: AccountSettings,
    },
    {
      id: 'password',
      title: '비밀번호 변경',
      description: '계정 보안을 위해 비밀번호를 변경합니다',
      icon: '🔐',
      component: PasswordChange,
    },
    {
      id: 'role',
      title: '가입 유형 등록/변경',
      description: '전문가, 보호소 운영자 등의 역할을 추가/변경합니다',
      icon: '🧑‍⚕️',
      component: RoleSettings,
    },
    {
      id: 'face',
      title: '얼굴 인증 관리',
      description: '등록된 얼굴 이미지로 로그인 설정을 관리합니다',
      icon: '📸',
      component: FaceSettings,
    },
  ];

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleBack = () => {
    setActiveSection(null);
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      // 실제로는 로그아웃 처리
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 회원 탈퇴를 하시겠습니까?\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      if (window.confirm('회원 탈퇴를 진행하시겠습니까? 이 작업은 취소할 수 없습니다.')) {
        // 실제로는 회원 탈퇴 API 호출
        alert('회원 탈퇴가 완료되었습니다.');
        localStorage.clear();
        navigate('/');
      }
    }
  };

  // 선택된 섹션의 컴포넌트 렌더링
  if (activeSection) {
    const ActiveComponent = settingsMenu.find((menu) => menu.id === activeSection)?.component;
    return <ActiveComponent onBack={handleBack} />;
  }

  // 메인 설정 메뉴
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h2 className={styles.sectionTitle}>설정</h2>
        <p className={styles.sectionDesc}>계정과 애플리케이션 설정을 관리합니다</p>
      </div>

      <div className={styles.settingsMenu}>
        {settingsMenu.map((menu) => (
          <div key={menu.id} className={styles.menuItem} onClick={() => handleMenuClick(menu.id)}>
            <div className={styles.menuIcon}>{menu.icon}</div>
            <div className={styles.menuContent}>
              <h3 className={styles.menuTitle}>{menu.title}</h3>
              <p className={styles.menuDesc}>{menu.description}</p>
            </div>
            <div className={styles.menuArrow}>›</div>
          </div>
        ))}
      </div>

      <div className={styles.dangerZone}>
        <h3 className={styles.dangerTitle}>기타 설정</h3>

        <button className={styles.logoutButton} onClick={handleLogout}>
          <span className={styles.buttonIcon}>🚪</span>
          로그아웃
        </button>

        <button className={styles.deleteAccountButton} onClick={handleDeleteAccount}>
          <span className={styles.buttonIcon}>⚠️</span>
          회원 탈퇴
        </button>
      </div>
    </div>
  );
};

export default SettingsList;
