import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import MypageTabBar from './components/MypageTabBar';
import ProfileInfo from './components/profile/ProfileInfo';
import PetList from './components/pets/PetList';
import ActivityList from './components/activity/ActivityList';
import BookmarkList from './components/bookmark/BookmarkList';
import SettingsList from './components/settings/SettingsList';
import ConsultationHistory from './components/consultation/ConsultationHistory';
import styles from './MypagePage.module.css';

const MypagePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, username, role } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');

  // 로그인하지 않은 경우 로그인 페이지로 이동
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isLoggedIn, navigate, location.pathname]);

  // location.state가 변경될 때 activeTab 업데이트
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // 탭 변경 핸들러
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // 탭별 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo />;
      case 'pets':
        return <PetList />;
      case 'activity':
        return <ActivityList />;
      case 'consultations':
        return <ConsultationHistory />;
      case 'bookmark':
        return <BookmarkList />;
      case 'settings':
        return <SettingsList />;
      default:
        return <ProfileInfo />;
    }
  };

  if (!isLoggedIn) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.mypageContainer}>
        <h1 className={styles.pageTitle}>마이페이지</h1>
        <div className={styles.userInfo}>
          <span className={styles.welcomeMessage}>
            {username}님, 환영합니다!
          </span>
          <span className={styles.roleLabel}>
            {role === 'admin' && '관리자'}
            {role === 'vet' && '전문가'}
            {role === 'shelter' && '보호소'}
            {(!role || role === 'user') && '일반회원'}
          </span>
        </div>
        <MypageTabBar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MypagePage;