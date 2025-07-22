import React from 'react';
import styles from './MypageTabBar.module.css';

const MypageTabBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', label: '프로필', icon: '👤' },
    { id: 'pets', label: '반려동물', icon: '🐾' },
    { id: 'activity', label: '내 활동', icon: '📝' },
    { id: 'consultations', label: '상담내역', icon: '💬' },
    { id: 'bookmark', label: '북마크', icon: '🔖' },
    { id: 'settings', label: '설정', icon: '⚙️' }
  ];

  return (
    <div className={styles.tabBarContainer}>
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MypageTabBar;