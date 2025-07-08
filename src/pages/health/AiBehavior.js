
// src/pages/health/AiBehavior.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AiBehavior.module.css';

const AiBehavior = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [behaviorType, setBehaviorType] = useState('');

  const behaviorTypes = [
    { value: 'walking', label: '걷기/보행' },
    { value: 'eating', label: '식사 행동' },
    { value: 'playing', label: '놀이 행동' },
    { value: 'sleeping', label: '수면 패턴' },
    { value: 'general', label: '일반 행동' }
  ];

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setSelectedVideo(videoUrl);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedVideo || !behaviorType) {
      alert('영상과 행동 유형을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    
    // 실제 AI 행동분석 API 호출 부분 (현재는 시뮬레이션)
    setTimeout(() => {
      setAnalysisResult({
        behaviorScore: 85,
        status: '정상',
        patterns: [
          { name: '활동량', value: 78, status: '정상' },
          { name: '움직임 패턴', value: 92, status: '양호' },
          { name: '균형감', value: 85, status: '정상' },
          { name: '반응성', value: 90, status: '우수' }
        ],
        insights: [
          '활발한 움직임을 보이고 있습니다.',
          '좌우 균형이 잘 맞습니다.',
          '정상적인 보행 패턴을 보입니다.',
          '환경 변화에 적절히 반응합니다.'
        ],
        recommendations: [
          '현재 상태를 잘 유지하세요.',
          '꾸준한 운동을 계속해주세요.',
          '정기적인 건강 검진을 받으세요.'
        ],
        alerts: []
      });
      setIsLoading(false);
    }, 4000);
  };

  const resetAnalysis = () => {
    setSelectedVideo(null);
    setAnalysisResult(null);
    setBehaviorType('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.analysisContainer}>
        <div className={styles.uploadSection}>
          <h3 className={styles.sectionTitle}>1. 행동 유형 선택</h3>
          <select className={styles.select} value={behaviorType} onChange={(e) => setBehaviorType(e.target.value)}>
            <option value="">분석할 행동 유형을 선택하세요</option>
            {behaviorTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <h3 className={styles.sectionTitle}>2. 영상 업로드</h3>
          <div className={styles.uploadArea}>
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleVideoUpload}
              style={{ display: 'none' }}
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <div className={styles.uploadButton}>
                🎥 영상 선택
              </div>
            </label>
            
            {selectedVideo && (
              <div className={styles.videoPreview}>
                <video src={selectedVideo} controls width="100%" />
              </div>
            )}
          </div>

          <button 
            className={styles.analysisButton}
            onClick={handleAnalysis}
            disabled={isLoading || !selectedVideo || !behaviorType}
          >
            {isLoading ? '분석 중...' : 'AI 행동분석 시작'}
          </button>
        </div>

        <div className={styles.resultSection}>
          {isLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner} />
              <p className={styles.loadingText}>AI가 영상을 분석중입니다...</p>
              <p className={styles.loadingSubtext}>영상 길이에 따라 1-5분 정도 소요됩니다.</p>
            </div>
          )}

          {analysisResult && (
            <div className={styles.resultContainer}>
              <div className={styles.resultHeader}>
                <h3 className={styles.resultTitle}>분석 결과</h3>
                <button className={styles.resetButton} onClick={resetAnalysis}>다시 분석</button>
              </div>
              
              <div className={styles.scoreCard}>
                <h4 className={styles.scoreTitle}>전체 행동 점수</h4>
                <div className={styles.scoreValue}>{analysisResult.behaviorScore}</div>
                <div className={`${styles.scoreStatus} ${styles[analysisResult.status]}`}>
                  {analysisResult.status}
                </div>
              </div>

              <div className={styles.patternSection}>
                <h4 className={styles.patternTitle}>행동 패턴 분석</h4>
                <div className={styles.patternGrid}>
                  {analysisResult.patterns.map((pattern, index) => (
                    <div key={index} className={styles.patternCard}>
                      <div className={styles.patternName}>{pattern.name}</div>
                      <div className={styles.patternScore}>{pattern.value}점</div>
                      <div className={`${styles.patternStatus} ${styles[pattern.status]}`}>
                        {pattern.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.insightsSection}>
                <h4 className={styles.insightsTitle}>🔍 주요 발견사항</h4>
                <ul className={styles.insightsList}>
                  {analysisResult.insights.map((insight, index) => (
                    <li key={index} className={styles.insightItem}>• {insight}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.recommendationsSection}>
                <h4 className={styles.recommendationsTitle}>💡 권장사항</h4>
                <ul className={styles.recommendationsList}>
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className={styles.recommendationItem}>• {rec}</li>
                  ))}
                </ul>
              </div>

              {analysisResult.alerts.length > 0 && (
                <div className={styles.alertSection}>
                  <h4 className={styles.alertTitle}>⚠️ 주의사항</h4>
                  <ul className={styles.alertList}>
                    {analysisResult.alerts.map((alert, index) => (
                      <li key={index} className={styles.alertItem}>• {alert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.infoTitle}>AI 행동분석 정보</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📊</div>
            <h4 className={styles.infoCardTitle}>정확도</h4>
            <p className={styles.infoCardText}>최신 AI 기술을 활용하여 95% 이상의 정확도로 분석합니다.</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>⏱️</div>
            <h4 className={styles.infoCardTitle}>분석 시간</h4>
            <p className={styles.infoCardText}>영상 길이에 따라 1-5분 내에 분석 결과를 제공합니다.</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🔒</div>
            <h4 className={styles.infoCardTitle}>개인정보보호</h4>
            <p className={styles.infoCardText}>업로드된 영상은 분석 후 자동으로 삭제됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiBehavior;
