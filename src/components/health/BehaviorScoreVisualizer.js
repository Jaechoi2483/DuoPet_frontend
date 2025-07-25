import React from 'react';
import styles from './BehaviorScoreVisualizer.module.css';

const BehaviorScoreVisualizer = ({ score, patterns, temporalData }) => {
  // 점수에 따른 색상 결정
  const getScoreColor = (value) => {
    if (value >= 80) return '#4CAF50'; // 녹색 (우수)
    if (value >= 60) return '#FFC107'; // 노란색 (정상)
    return '#FF5252'; // 빨간색 (주의)
  };

  // 원형 진행률 표시기를 위한 SVG 경로 계산
  const createCirclePath = (percentage) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return { circumference, offset };
  };

  // 전체 점수 원형 표시
  const mainScorePath = createCirclePath(score);
  const mainScoreColor = getScoreColor(score);

  return (
    <div className={styles.visualizerContainer}>
      {/* 메인 점수 원형 표시 */}
      <div className={styles.mainScoreSection}>
        <div className={styles.circularProgress}>
          <svg width="120" height="120">
            {/* 배경 원 */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="10"
            />
            {/* 진행률 원 */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={mainScoreColor}
              strokeWidth="10"
              strokeDasharray={mainScorePath.circumference}
              strokeDashoffset={mainScorePath.offset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className={styles.scoreText}>
            <span className={styles.scoreValue}>{score}</span>
            <span className={styles.scoreLabel}>점</span>
          </div>
        </div>
        <h3 className={styles.scoreTitle}>전체 행동 점수</h3>
      </div>

      {/* 개별 패턴 점수 바 차트 */}
      <div className={styles.patternsSection}>
        <h4 className={styles.sectionTitle}>세부 평가 항목</h4>
        <div className={styles.patternsList}>
          {patterns.map((pattern, index) => (
            <div key={index} className={styles.patternItem}>
              <div className={styles.patternHeader}>
                <span className={styles.patternName}>{pattern.name}</span>
                <span className={styles.patternValue}>{pattern.value}점</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${pattern.value}%`,
                    backgroundColor: getScoreColor(pattern.value)
                  }}
                />
              </div>
              <span className={`${styles.patternStatus} ${styles[pattern.status.replace(' ', '')]}`}>
                {pattern.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 시간적 분석 시각화 (옵션) */}
      {temporalData && temporalData.activity_summary && (
        <div className={styles.temporalSection}>
          <h4 className={styles.sectionTitle}>활동 분석</h4>
          <div className={styles.activityChart}>
            <div className={styles.activityBar}>
              <div className={styles.activityLabel}>활동</div>
              <div className={styles.activityProgress}>
                <div
                  className={styles.activityFill}
                  style={{
                    width: `${temporalData.activity_summary.activity_ratio * 100}%`,
                    backgroundColor: '#4CAF50'
                  }}
                />
              </div>
              <span className={styles.activityPercent}>
                {Math.round(temporalData.activity_summary.activity_ratio * 100)}%
              </span>
            </div>
            <div className={styles.activityBar}>
              <div className={styles.activityLabel}>휴식</div>
              <div className={styles.activityProgress}>
                <div
                  className={styles.activityFill}
                  style={{
                    width: `${(1 - temporalData.activity_summary.activity_ratio) * 100}%`,
                    backgroundColor: '#2196F3'
                  }}
                />
              </div>
              <span className={styles.activityPercent}>
                {Math.round((1 - temporalData.activity_summary.activity_ratio) * 100)}%
              </span>
            </div>
          </div>
          
          {/* 추가 메트릭 */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>행동 다양성</div>
              <div className={styles.metricValue}>
                {Math.round(temporalData.activity_summary.behavior_diversity * 100)}%
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>전환 빈도</div>
              <div className={styles.metricValue}>
                {temporalData.activity_summary.transition_rate.toFixed(1)}/분
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviorScoreVisualizer;