// src/components/common/ProgressBar.js
import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ progress = 0, status = '', showPercentage = true, className = '' }) => {
  // 진행률을 0-100 범위로 제한
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // 진행 상태에 따른 색상 클래스 결정
  const getProgressClass = () => {
    if (normalizedProgress === 100) return styles.complete;
    if (normalizedProgress > 75) return styles.active;
    return styles.pending;
  };

  return (
    <div className={`${styles.progressContainer} ${className}`}>
      <div className={styles.progressWrapper}>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${getProgressClass()}`}
            style={{ width: `${normalizedProgress}%` }}
          >
            {showPercentage && normalizedProgress > 10 && (
              <span className={styles.progressText}>{normalizedProgress}%</span>
            )}
          </div>
        </div>
        {showPercentage && normalizedProgress <= 10 && (
          <span className={styles.progressTextOutside}>{normalizedProgress}%</span>
        )}
      </div>
      {status && (
        <div className={styles.statusMessage}>{status}</div>
      )}
    </div>
  );
};

export default ProgressBar;