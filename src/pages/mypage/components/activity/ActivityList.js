import React, { useState } from 'react';
import styles from './ActivityList.module.css';
import MyPosts from './MyPosts';
import MyComments from './MyComments';
import MyLikedPosts from './MyLikedPosts';
import MyBookmarkedPosts from './MyBookmarkedPosts';

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
            className={`${styles.tabButton} ${activeSection === 'comments' ? styles.active : ''}`}
            onClick={() => handleSectionChange('comments')}
          >
            댓글단 글
          </button>
          <button
            className={`${styles.tabButton} ${activeSection === 'likes' ? styles.active : ''}`}
            onClick={() => handleSectionChange('likes')}
          >
            좋아요
          </button>
          <button
            className={`${styles.tabButton} ${activeSection === 'bookmarks' ? styles.active : ''}`}
            onClick={() => handleSectionChange('bookmarks')}
          >
            북마크
          </button>
        </div>
      </div>

      <div className={styles.sectionContent}>
        {activeSection === 'posts' && <MyPosts />}
        {activeSection === 'comments' && <MyComments />}
        {activeSection === 'likes' && <MyLikedPosts />}
        {activeSection === 'bookmarks' && <MyBookmarkedPosts />}
      </div>
    </div>
  );
};

export default ActivityList;
