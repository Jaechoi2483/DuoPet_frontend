
// src/pages/health/AiDiagnosis.js
import React, { useState } from 'react';
import styles from './AiDiagnosis.module.css';
import { analyzeHealthComprehensive } from '../../api/healthApi';

const AiDiagnosis = ({ pet }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // 실제 파일 객체 저장
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [error, setError] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      setSelectedFile(file); // 실제 파일 객체 저장
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnosis = async () => {
    if (!selectedFile || !symptomsDescription.trim()) {
      alert('이미지와 증상 설명을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // 펫 정보 구성
      const petInfo = pet ? {
        age: pet.age || '',
        breed: pet.breed || '',
        weight: pet.weight || '',
        symptoms: symptomsDescription
      } : {
        symptoms: symptomsDescription
      };

      // 실제 AI 진단 API 호출
      const response = await analyzeHealthComprehensive(
        [selectedFile], // 이미지 배열로 전달
        pet?.type || 'dog', // 반려동물 타입
        petInfo
      );

      console.log('진단 결과 전체:', response);
      console.log('진단 결과 success:', response?.success);
      console.log('진단 결과 data:', response?.data);

      // API 응답을 UI에 맞게 변환
      // axios response는 response.data에 실제 API 응답이 있음
      // StandardResponse 형식: { success, data, message, ... }
      if (response && response.data && response.data.data) {
        const diagnosisData = response.data.data;
        
        // 건강 상태에 따른 심각도 매핑
        const severityMap = {
          'excellent': 'mild',
          'good': 'mild',
          'fair': 'moderate',
          'poor': 'severe',
          'critical': 'severe'
        };

        // 우선순위에 따른 심각도 매핑 (백업)
        const priorityMap = {
          'low': 'mild',
          'medium': 'moderate',
          'high': 'severe'
        };

        // 결과 설정
        setDiagnosisResult({
          confidence: Math.round(diagnosisData.overall_health_score || 0),
          diagnosis: response.data.message || '진단이 완료되었습니다.',
          severity: severityMap[diagnosisData.health_status] || priorityMap[diagnosisData.priority_level] || 'mild',
          description: diagnosisData.critical_findings?.join(', ') || '',
          recommendations: diagnosisData.comprehensive_recommendations || [],
          nextSteps: diagnosisData.critical_findings || [],
          requiresVet: diagnosisData.requires_vet_visit || false,
          // 개별 진단 결과도 포함
          eyeResult: diagnosisData.individual_assessments?.eye_health,
          bcsResult: diagnosisData.individual_assessments?.body_condition,
          skinResult: diagnosisData.individual_assessments?.skin_health
        });
      } else {
        throw new Error(response?.data?.message || response?.message || '진단 결과를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('AI 진단 실패:', error);
      setError('AI 진단 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 오류 발생 시 기본 메시지 표시
      if (error.response?.status === 401) {
        setError('로그인이 필요합니다.');
      } else if (error.response?.status === 413) {
        setError('이미지 파일이 너무 큽니다. 5MB 이하의 파일을 업로드해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetDiagnosis = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setDiagnosisResult(null);
    setSymptomsDescription('');
    setError(null);
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

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

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

                  {/* 개별 진단 결과 표시 */}
                  {(diagnosisResult.eyeResult || diagnosisResult.bcsResult || diagnosisResult.skinResult) && (
                    <div className={styles.detailedResults}>
                      <h5 className={styles.detailedTitle}>🔍 상세 진단 결과</h5>
                      
                      {diagnosisResult.eyeResult && (
                        <div className={styles.detailCard}>
                          <h6 className={styles.detailCardTitle}>👁️ 안구 검사</h6>
                          <p className={styles.detailText}>
                            {diagnosisResult.eyeResult.disease || '정상'} 
                            ({Math.round(diagnosisResult.eyeResult.confidence * 100)}% 신뢰도)
                          </p>
                        </div>
                      )}
                      
                      {diagnosisResult.bcsResult && (
                        <div className={styles.detailCard}>
                          <h6 className={styles.detailCardTitle}>⚖️ 체형 평가</h6>
                          <p className={styles.detailText}>
                            BCS 점수: {diagnosisResult.bcsResult.bcs_score}/9
                            <br />
                            {diagnosisResult.bcsResult.condition}
                          </p>
                        </div>
                      )}
                      
                      {diagnosisResult.skinResult && (
                        <div className={styles.detailCard}>
                          <h6 className={styles.detailCardTitle}>🩹 피부 검사</h6>
                          <p className={styles.detailText}>
                            {diagnosisResult.skinResult.diagnosis || '정상'}
                            {diagnosisResult.skinResult.severity && ` (${diagnosisResult.skinResult.severity})`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
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
