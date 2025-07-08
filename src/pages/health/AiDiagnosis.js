
// src/pages/health/AiDiagnosis.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AiDiagnosis.module.css';

const AiDiagnosis = ({ pet }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [symptomsDescription, setSymptomsDescription] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnosis = async () => {
    if (!selectedImage || !symptomsDescription.trim()) {
      alert('이미지와 증상 설명을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    // AI 진단 시뮬레이션
    setTimeout(() => {
      setDiagnosisResult({
        confidence: 85,
        diagnosis: '경미한 상부 호흡기 감염',
        severity: 'mild',
        description: 'AI 분석 결과, 반려동물이 경미한 상부 호흡기 감염 증상을 보일 가능성이 높습니다.',
        recommendations: [
          '따뜻한 환경 유지 및 충분한 휴식 제공',
          '수분 섭취 권장 (신선한 물 제공)',
          '증상 악화 시 즉시 동물병원 방문'
        ],
        nextSteps: [
          '2-3일 관찰 후 개선되지 않으면 병원 방문',
          '식욕 부진이 지속될 경우 즉시 상담',
          '호흡 곤란 증상 시 응급 처치'
        ]
      });
      setIsLoading(false);
    }, 3000);
  };

  const resetDiagnosis = () => {
    setSelectedImage(null);
    setDiagnosisResult(null);
    setSymptomsDescription('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.warningCard}>
        <div className={styles.warningIcon}>⚠️</div>
        <div className={styles.warningContent}>
          <h3 className={styles.warningTitle}>주의: AI 진단 결과는 참고용입니다.</h3>
          <p className={styles.warningText}>정확한 진단은 반드시 수의사와의 상담을 통해 이루어져야 합니다.</p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainContent}>
          <div className={styles.section}>
            <div className={styles.card}>
              <div className={styles.cardContent}>
                <p className={styles.description}>
                  증상이 나타난 부위의 사진을 업로드해주세요. 명확하고 밝은 사진이 진단에 도움이 됩니다.
                </p>
                
                <div className={styles.uploadArea} onClick={() => document.getElementById('image-upload').click()}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  {selectedImage ? (
                    <div className={styles.imagePreview}>
                      <img src={selectedImage} alt="업로드된 이미지" />
                      <div className={styles.imageOverlay}>
                        <span>다른 이미지로 변경하려면 클릭하세요</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <div className={styles.uploadIcon}>📁</div>
                      <div className={styles.uploadText}>이미지를 클릭하여 업로드</div>
                      <div className={styles.uploadSubtext}>(JPG, PNG, 최대 5MB)</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.card}>
              <div className={styles.cardContent}>
                <p className={styles.description}>
                  반려동물의 증상에 대해 최대한 자세히 설명해주세요.
                </p>
                
                <textarea 
                  className={styles.textArea}
                  value={symptomsDescription}
                  onChange={(e) => setSymptomsDescription(e.target.value)}
                  placeholder="예: 어제부터 기침을 하고 밥을 잘 안 먹어요. 콧물이 조금 있고, 활동량이 줄었습니다."
                  rows={6}
                />
              </div>
            </div>
          </div>

          <button 
            className={styles.diagnosisButton}
            onClick={handleDiagnosis}
            disabled={isLoading || !selectedImage || !symptomsDescription.trim()}
          >
            {isLoading ? '진단 중...' : '🔬 AI 진단 시작하기'}
          </button>

          <div className={styles.actionButtons}>
            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>👩‍⚕️</span>
              수의사 상담받기
            </button>
            <button className={styles.actionButton}>
              <span className={styles.actionIcon}>🏥</span>
              가까운 병원 찾기
            </button>
          </div>
        </div>

        <div className={styles.sidebar}>
          {isLoading && (
            <div className={styles.loadingSection}>
              <div className={styles.loadingCard}>
                <div className={styles.loadingSpinner} />
                <h3 className={styles.loadingTitle}>AI가 이미지를 분석중입니다</h3>
                <p className={styles.loadingText}>잠시만 기다려주세요...</p>
              </div>
            </div>
          )}

          {diagnosisResult && (
            <div className={styles.resultSection}>
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <div className={`${styles.resultIcon} ${styles[diagnosisResult.severity]}`}>🩺</div>
                  <h3 className={styles.resultTitle}>AI 진단 결과</h3>
                  <button className={styles.resetButton} onClick={resetDiagnosis}>다시 진단</button>
                </div>
                
                <div className={styles.resultContent}>
                  <h4 className={styles.diagnosisTitle}>{diagnosisResult.diagnosis}</h4>
                  <div className={styles.confidenceBar}>
                    <div className={styles.confidenceLabel}>신뢰도: {diagnosisResult.confidence}%</div>
                    <div className={styles.confidenceProgress}>
                      <div className={styles.confidenceFill} style={{width: `${diagnosisResult.confidence}%`}} />
                    </div>
                  </div>
                  
                  <div className={`${styles.severityBadge} ${styles[diagnosisResult.severity]}`}>
                    {diagnosisResult.severity === 'mild' && '경미'}
                    {diagnosisResult.severity === 'moderate' && '보통'}
                    {diagnosisResult.severity === 'severe' && '심각'}
                  </div>
                  
                  <p className={styles.resultDescription}>
                    {diagnosisResult.description}
                  </p>

                  <div className={styles.recommendationsSection}>
                    <h5 className={styles.recommendationsTitle}>💡 권장 조치</h5>
                    <ul className={styles.recommendationsList}>
                      {diagnosisResult.recommendations.map((rec, index) => (
                        <li key={index} className={styles.recommendationItem}>
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.nextStepsSection}>
                    <h5 className={styles.nextStepsTitle}>📋 다음 단계</h5>
                    <ol className={styles.nextStepsList}>
                      {diagnosisResult.nextSteps.map((step, index) => (
                        <li key={index} className={styles.nextStepItem}>
                          {index + 1}. {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiDiagnosis;
