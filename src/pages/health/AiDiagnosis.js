import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AiDiagnosis.module.css';
import { analyzeSingleDiagnosis } from '../../api/healthApi';

const AiDiagnosis = ({ pet }) => {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // 실제 파일 객체 저장
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [error, setError] = useState(null);
  const [diagnosisType, setDiagnosisType] = useState(''); // 진단 유형 선택

  // 진단 유형별 설정
  const diagnosisTypeConfig = {
    eye: {
      name: '안구 질환 진단',
      minImages: 1,
      recommendedImages: 2,
      description: '백내장, 각막궤양 등 안구 질환을 진단합니다',
      guide: '양쪽 눈을 각각 클로즈업으로 촬영하세요',
    },
    bcs: {
      name: '체형 평가 (BCS)',
      minImages: 3,
      recommendedImages: 13,
      description: '반려동물의 체형 상태를 9단계로 평가합니다',
      guide: '정면, 옆면, 위에서 등 다양한 각도로 전신을 촬영하세요',
    },
    skin: {
      name: '피부 질환 진단',
      minImages: 1,
      recommendedImages: 1,
      description: '피부 질환의 유무와 종류를 진단합니다',
      guide: '문제가 있는 피부 부위를 클로즈업으로 촬영하세요',
    },
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    if (!diagnosisType) {
      setError('먼저 진단 유형을 선택해주세요.');
      return;
    }

    const maxImages = diagnosisType === 'bcs' ? 13 : 5;
    const totalImages = selectedFiles.length + files.length;

    if (totalImages > maxImages) {
      setError(`최대 ${maxImages}장까지만 업로드 가능합니다.`);
      return;
    }

    const validFiles = [];
    const imageUrls = [];

    for (const file of files) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      validFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        imageUrls.push(e.target.result);
        if (imageUrls.length === files.length) {
          setSelectedFiles([...selectedFiles, ...validFiles]);
          setSelectedImages([...selectedImages, ...imageUrls]);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnosis = async () => {
    if (!diagnosisType) {
      alert('진단 유형을 선택해주세요.');
      return;
    }

    const config = diagnosisTypeConfig[diagnosisType];
    if (selectedFiles.length < config.minImages) {
      alert(`${config.name}은 최소 ${config.minImages}장의 사진이 필요합니다.`);
      return;
    }

    if (!symptomsDescription.trim()) {
      alert('증상 설명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 펫 정보 구성
      const petInfo = pet
        ? {
            age: pet.age || '',
            breed: pet.breed || '',
            weight: pet.weight || '',
          }
        : {}; // symptoms는 이제 별도 인자로 전달

      // animalType을 영어로 변환 ('강아지' -> 'dog', '고양이' -> 'cat')
      const petType = pet?.animalType === '고양이' ? 'cat' : 'dog';

      const response = await analyzeSingleDiagnosis(
        selectedFiles,
        diagnosisType,
        symptomsDescription, // 증상 설명을 별도 인자로 전달
        petType,
        petInfo
      );

      console.log('진단 결과 전체:', response);
      console.log('진단 결과 success:', response?.success);
      console.log('진단 결과 data:', response?.data);

      if (response && response.data && response.data.results) {
        const results = response.data.results;
        let processedResult = {
          potential_conditions: results.potential_conditions || [],
          severity: results.severity || 'mild',
          explanation: results.explanation || '제공된 정보가 부족하여 상세 설명을 생성할 수 없습니다.',
          recommendations: results.recommendations || [],
          requires_vet_visit: results.requires_vet_visit || false,
          confidence: NaN, // 신뢰도 필드 추가 (AI 응답에 직접 없으면 NaN 또는 0)
          diagnosis: '결과 확인 필요', // 이 부분은 AI 응답의 potential_conditions 기반으로 생성해야 함
          nextSteps: results.recommendations ? results.recommendations.slice(0, 3) : [], // recommendations 기반으로 nextSteps 생성
        };

        if (processedResult.potential_conditions && processedResult.potential_conditions.length > 0) {
          processedResult.diagnosis = processedResult.potential_conditions.join(', ');
        } else {
          if (processedResult.explanation && processedResult.explanation.includes('정상')) {
            processedResult.diagnosis = '정상';
          } else {
            processedResult.diagnosis = '정상'; // 기본적으로 '정상'으로 설정
          }
        }

        // 프론트엔드 UI에 맞는 데이터 구조로 매핑 (정상 케이스 처리 강화)
        if (processedResult.potential_conditions.length === 0 && processedResult.severity === 'mild') {
          processedResult.diagnosis = '정상';
          processedResult.description = processedResult.explanation || '정상적인 건강 상태입니다.';
        } else {
          processedResult.description = processedResult.explanation;
        }

        setDiagnosisResult(processedResult);
      } else {
        throw new Error('진단 결과를 받지 못했습니다. 응답 형식을 확인해주세요.');
      }
    } catch (error) {
      console.error('AI 진단 실패:', error);
      setError('AI 진단 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');

      if (error.response?.status === 401) {
        setError('로그인이 필요합니다.');
      } else if (error.response?.status === 413) {
        setError('이미지 파일이 너무 큽니다. 5MB 이하의 파일을 업로드해주세요.');
      } else if (error.response?.data?.detail) {
        setError(`오류: ${error.response.data.detail}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetDiagnosis = () => {
    setSelectedImages([]);
    setSelectedFiles([]);
    setDiagnosisResult(null);
    setSymptomsDescription('');
    setError(null);
    setDiagnosisType('');
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
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
          {/* 진단 유형 선택 섹션 */}
          <div className={styles.section}>
            <div className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.sectionTitle}>📋 진단 유형 선택</h3>
                <p className={styles.description}>
                  원하시는 진단 유형을 선택해주세요. 각 진단은 개별적으로 수행됩니다.
                </p>

                <div className={styles.diagnosisTypeGrid}>
                  {Object.entries(diagnosisTypeConfig).map(([key, config]) => (
                    <div
                      key={key}
                      className={`${styles.diagnosisTypeCard} ${diagnosisType === key ? styles.selected : ''}`}
                      onClick={() => {
                        setDiagnosisType(key);
                        setSelectedImages([]);
                        setSelectedFiles([]);
                        setError(null);
                      }}
                    >
                      <div className={styles.diagnosisTypeIcon}>
                        {key === 'eye' && '👁️'}
                        {key === 'bcs' && '⚖️'}
                        {key === 'skin' && '🩹'}
                      </div>
                      <h4 className={styles.diagnosisTypeName}>{config.name}</h4>
                      <p className={styles.diagnosisTypeDesc}>{config.description}</p>
                      <div className={styles.diagnosisTypeInfo}>
                        <span className={styles.imageRequirement}>
                          최소 {config.minImages}장 / 권장 {config.recommendedImages}장
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 이미지 업로드 섹션 */}
          {diagnosisType && (
            <div className={styles.section}>
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  <h3 className={styles.sectionTitle}>📷 사진 업로드</h3>
                  <p className={styles.description}>{diagnosisTypeConfig[diagnosisType].guide}</p>

                  <div className={styles.uploadArea} onClick={() => document.getElementById('image-upload').click()}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple={diagnosisType === 'bcs' || diagnosisType === 'skin' || diagnosisType === 'eye'} // 모든 유형에서 복수 이미지 허용
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="image-upload"
                    />
                    {selectedImages.length > 0 ? (
                      <div className={styles.imagePreviewGrid}>
                        {selectedImages.map((image, index) => (
                          <div key={index} className={styles.imagePreviewItem}>
                            <img src={image} alt={`업로드된 이미지 ${index + 1}`} />
                            <button
                              className={styles.removeImageBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {selectedImages.length < (diagnosisType === 'bcs' ? 13 : 5) && (
                          <div className={styles.addMoreImages}>
                            <div className={styles.uploadIcon}>➕</div>
                            <div className={styles.uploadText}>추가 업로드</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <div className={styles.uploadIcon}>📁</div>
                        <div className={styles.uploadText}>이미지를 클릭하여 업로드</div>
                        <div className={styles.uploadSubtext}>
                          {diagnosisType === 'bcs' ? '여러 장 선택 가능' : '(JPG, PNG, 최대 5MB)'}
                        </div>
                      </div>
                    )}
                  </div>

                  {diagnosisType === 'bcs' && selectedImages.length < 13 && selectedImages.length > 0 && (
                    <div className={styles.bcsWarning}>
                      ℹ️ 현재 {selectedImages.length}장이 업로드되었습니다. 정확한 체형 평가를 위해 13장의 사진을
                      권장합니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.card}>
              <div className={styles.cardContent}>
                <p className={styles.description}>반려동물의 증상에 대해 최대한 자세히 설명해주세요.</p>

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
            disabled={isLoading || !diagnosisType || selectedFiles.length === 0 || !symptomsDescription.trim()}
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
            <button className={styles.actionButton} onClick={() => navigate('/health/expert-consult')}>
              <span className={styles.actionIcon}>👩‍⚕️</span>
              수의사 상담받기
            </button>
            <button className={styles.actionButton} onClick={() => navigate('/info/hospital')}>
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
                  <button className={styles.resetButton} onClick={resetDiagnosis}>
                    다시 진단
                  </button>
                </div>

                <div className={styles.resultContent}>
                  <h4 className={styles.diagnosisTitle}>
                    {diagnosisResult.potential_conditions && diagnosisResult.potential_conditions.length > 0
                      ? diagnosisResult.potential_conditions.join(', ')
                      : diagnosisResult.diagnosis || '정상'}
                  </h4>
                  <div className={styles.confidenceBar}>
                    <div className={styles.confidenceLabel}>
                      신뢰도: {isNaN(diagnosisResult.confidence) ? '정보 없음' : `${diagnosisResult.confidence}%`}
                      {diagnosisResult.confidence < 50 && !isNaN(diagnosisResult.confidence) && ' (낮음)'}
                      {diagnosisResult.confidence >= 50 &&
                        diagnosisResult.confidence < 70 &&
                        !isNaN(diagnosisResult.confidence) &&
                        ' (보통)'}
                      {diagnosisResult.confidence >= 70 && !isNaN(diagnosisResult.confidence) && ' (높음)'}
                    </div>
                    <div className={styles.confidenceProgress}>
                      <div
                        className={styles.confidenceFill}
                        style={{
                          width: `${isNaN(diagnosisResult.confidence) ? 0 : diagnosisResult.confidence}%`,
                          backgroundColor: isNaN(diagnosisResult.confidence)
                            ? '#ccc'
                            : diagnosisResult.confidence < 50
                              ? '#ff6b6b'
                              : diagnosisResult.confidence < 70
                                ? '#ffd43b'
                                : '#51cf66',
                        }}
                      />
                    </div>
                  </div>

                  <div className={`${styles.severityBadge} ${styles[diagnosisResult.severity]}`}>
                    {diagnosisResult.severity === 'mild' && '경미'}
                    {diagnosisResult.severity === 'moderate' && '보통'}
                    {diagnosisResult.severity === 'severe' && '심각'}
                  </div>

                  <p className={styles.resultDescription}>{diagnosisResult.explanation}</p>

                  {/* 확률 상세 정보 표시 */}
                  {diagnosisResult.binary_probabilities && (
                    <div className={styles.probabilitySection}>
                      <h5 className={styles.probabilityTitle}>📊 상세 확률 정보</h5>
                      <div className={styles.probabilityBars}>
                        <div className={styles.probabilityItem}>
                          <span className={styles.probabilityLabel}>정상:</span>
                          <div className={styles.probabilityBar}>
                            <div
                              className={styles.probabilityFill}
                              style={{
                                width: `${(diagnosisResult.binary_probabilities.normal || 0) * 100}%`,
                                backgroundColor: '#51cf66',
                              }}
                            />
                          </div>
                          <span className={styles.probabilityValue}>
                            {((diagnosisResult.binary_probabilities.normal || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className={styles.probabilityItem}>
                          <span className={styles.probabilityLabel}>질환:</span>
                          <div className={styles.probabilityBar}>
                            <div
                              className={styles.probabilityFill}
                              style={{
                                width: `${(diagnosisResult.binary_probabilities.disease || 0) * 100}%`,
                                backgroundColor: '#ff6b6b',
                              }}
                            />
                          </div>
                          <span className={styles.probabilityValue}>
                            {((diagnosisResult.binary_probabilities.disease || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 경고 메시지 */}
                  {diagnosisResult.warning && (
                    <div className={styles.warningMessage}>
                      <span className={styles.warningIcon}>⚠️</span>
                      <p>{diagnosisResult.warning}</p>
                    </div>
                  )}

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

                  {/* 진단 유형 표시 */}
                  <div className={styles.diagnosisTypeIndicator}>
                    <span className={styles.diagnosisTypeLabel}>진단 유형:</span>
                    <span className={styles.diagnosisTypeValue}>{diagnosisTypeConfig[diagnosisType]?.name}</span>
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
