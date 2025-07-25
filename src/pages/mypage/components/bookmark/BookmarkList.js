import React, { useState } from 'react';
import styles from './BookmarkList.module.css';
import BookmarkedPosts from './BookmarkedPosts';
import BookmarkedPlaces from './BookmarkedPlaces';
import BookmarkedAdoptions from './BookmarkedAdoptions';

const BookmarkList = () => {
  const [activeCategory, setActiveCategory] = useState('posts');

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  return (
    <div className={styles.bookmarkContainer}>
      <div className={styles.bookmarkHeader}>
        <h2 className={styles.sectionTitle}>북마크</h2>
        <p className={styles.sectionDesc}>관심있는 콘텐츠를 모아보세요</p>
      </div>

      <div className={styles.categoryTabs}>
        <button
          className={`${styles.categoryTab} ${activeCategory === 'posts' ? styles.active : ''}`}
          onClick={() => handleCategoryChange('posts')}
        >
          <span className={styles.tabIcon}>📝</span>
          게시글
        </button>
        <button
          className={`${styles.categoryTab} ${activeCategory === 'places' ? styles.active : ''}`}
          onClick={() => handleCategoryChange('places')}
        >
          <span className={styles.tabIcon}>🏥</span>
          병원/보호소
        </button>
        <button
          className={`${styles.categoryTab} ${activeCategory === 'adoptions' ? styles.active : ''}`}
          onClick={() => handleCategoryChange('adoptions')}
        >
          <span className={styles.tabIcon}>🐾</span>
          입양동물
        </button>
      </div>

      <div className={styles.categoryContent}>
        {activeCategory === 'posts' && <BookmarkedPosts />}
        {activeCategory === 'places' && <BookmarkedPlaces />}
        {activeCategory === 'adoptions' && <BookmarkedAdoptions />}
      </div>
    </div>
  );
};

export default BookmarkList;