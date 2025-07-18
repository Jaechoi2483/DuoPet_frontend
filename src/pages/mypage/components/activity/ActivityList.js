import React, { useState } from 'react';
import styles from './ActivityList.module.css';
import MyPosts from './MyPosts';
import MyConsultations from './MyConsultations';

const ActivityList = () => {
  const [activeSection, setActiveSection] = useState('posts');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className={styles.activityContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>내 활동</h2>
        <div className={styles.sectionTabs}>
          <button
            className={`${styles.tabButton} ${activeSection === 'posts' ? styles.active : ''}`}
            onClick={() => handleSectionChange('posts')}
          >
            작성한 글
          </button>
          <button
            className={`${styles.tabButton} ${activeSection === 'consultations' ? styles.active : ''}`}
            onClick={() => handleSectionChange('consultations')}
          >
            상담 내역
          </button>
        </div>
      </div>

      <div className={styles.sectionContent}>
        {activeSection === 'posts' && <MyPosts />}
        {activeSection === 'consultations' && <MyConsultations />}
      </div>
    </div>
  );
};

export default ActivityList;