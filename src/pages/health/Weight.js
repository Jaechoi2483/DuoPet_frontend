// src/pages/health/Weight.js
import React, { useState, useEffect } from 'react';
import styles from './Weight.module.css';
import Modal from '../../components/common/Modal'; // 1. 공용 모달 컴포넌트 가져오기
import { createWeight, getWeightsByPet, updateWeight, deleteWeight } from '../../api/weightApi';

// SVG로 직접 구현하는 라인 차트 컴포넌트
function LineChart({ weights }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!weights || weights.length === 0) {
    return (
      <div className={styles.chartPlaceholder}>
        📈 체중 변화 차트
        <p>체중 기록을 추가하면 그래프가 표시됩니다.</p>
      </div>
    );
  }

  // 최근 10개 데이터만 표시
  const recentWeights = weights.slice(-10);

  // SVG 크기 및 여백 설정
  const width = 600;
  const height = 250;
  const padding = { top: 20, right: 40, bottom: 40, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 데이터 범위 계산
  const weightValues = recentWeights.map((w) => w.weight);
  const minWeight = Math.min(...weightValues) * 0.9;
  const maxWeight = Math.max(...weightValues) * 1.1;
  const weightRange = maxWeight - minWeight;

  // 좌표 변환 함수
  const xScale = (index) => (index / (recentWeights.length - 1)) * chartWidth + padding.left;
  const yScale = (weight) => height - padding.bottom - ((weight - minWeight) / weightRange) * chartHeight;

  // 라인 경로 생성
  const linePath = recentWeights.map((w, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(w.weight)}`).join(' ');

  // Y축 눈금 생성 (5개)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = minWeight + (weightRange * i) / 4;
    return {
      value: value.toFixed(1),
      y: yScale(value),
    };
  });

  return (
    <div className={styles.chartContainer}>
      <svg width={width} height={height} className={styles.lineChart}>
        {/* 그리드 라인 */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="#e5e7eb"
              strokeDasharray="2,2"
            />
            <text x={padding.left - 10} y={tick.y + 5} textAnchor="end" fontSize="12" fill="#6b7280">
              {tick.value}kg
            </text>
          </g>
        ))}

        {/* X축 라벨 */}
        {recentWeights.map((w, i) => {
          if (i % Math.ceil(recentWeights.length / 5) === 0) {
            return (
              <text
                key={i}
                x={xScale(i)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {new Date(w.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
              </text>
            );
          }
          return null;
        })}

        {/* 체중 라인 */}
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />

        {/* 데이터 포인트 */}
        {recentWeights.map((w, i) => (
          <g key={i}>
            <circle
              cx={xScale(i)}
              cy={yScale(w.weight)}
              r="4"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className={styles.dataPoint}
              onMouseEnter={() => setHoveredPoint({ x: xScale(i), y: yScale(w.weight), data: w })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}

        {/* 툴팁 */}
        {hoveredPoint && (
          <g>
            <rect
              x={hoveredPoint.x - 40}
              y={hoveredPoint.y - 35}
              width="80"
              height="30"
              fill="rgba(0, 0, 0, 0.8)"
              rx="4"
              ry="4"
            />
            <text
              x={hoveredPoint.x}
              y={hoveredPoint.y - 20}
              textAnchor="middle"
              fontSize="12"
              fill="white"
              fontWeight="bold"
            >
              {hoveredPoint.data.weight}kg
            </text>
            <text x={hoveredPoint.x} y={hoveredPoint.y - 8} textAnchor="middle" fontSize="10" fill="white">
              {new Date(hoveredPoint.data.date).toLocaleDateString('ko-KR')}
            </text>
          </g>
        )}

        {/* 축 라벨 */}
        <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="12" fill="#6b7280">
          날짜
        </text>
        <text
          x={20}
          y={height / 2}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
          transform={`rotate(-90 20 ${height / 2})`}
        >
          체중 (kg)
        </text>
      </svg>
    </div>
  );
}

const Weight = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ date: '', weight: '', memo: '' });

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 체중 기록 조회
  useEffect(() => {
    if (pet?.petId) {
      fetchWeights();
    }
  }, [pet]);

  const fetchWeights = async () => {
    if (!pet?.petId) return;

    try {
      setLoading(true);
      const data = await getWeightsByPet(pet.petId);
      // 날짜순으로 정렬 (오래된 것부터)
      const sortedData = data.sort((a, b) => new Date(a.measuredDate) - new Date(b.measuredDate));
      // API 응답 데이터 형식에 맞게 변환
      const formattedWeights = sortedData.map((w) => ({
        weightId: w.weightId,
        date: w.measuredDate,
        weight: parseFloat(w.weightKg),
        memo: w.memo || '',
      }));
      setWeights(formattedWeights);
    } catch (error) {
      console.error('체중 기록 조회 실패:', error);
      alert('체중 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.weight) {
      alert('측정일과 체중을 입력해주세요.');
      return;
    }

    if (!pet?.petId) {
      alert('반려동물을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      const weightData = {
        petId: pet.petId,
        weightKg: parseFloat(formData.weight),
        measuredDate: formData.date,
        memo: formData.memo || null,
      };

      await createWeight(weightData);
      await fetchWeights(); // 목록 새로고침

      setIsModalOpen(false);
      setFormData({ date: '', weight: '', memo: '' });
      setCurrentPage(1); // 첫 페이지로 이동
      alert('체중이 기록되었습니다.');
    } catch (error) {
      console.error('체중 기록 실패:', error);
      alert('체중 기록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 체중 기록 클릭 시 상세 보기
  const handleWeightClick = (weight) => {
    setSelectedWeight(weight);
    setIsDetailModalOpen(true);
    setIsEditMode(false);
  };

  // 수정 모드로 전환
  const handleEditClick = () => {
    setFormData({
      date: selectedWeight.date,
      weight: selectedWeight.weight.toString(),
      memo: selectedWeight.memo || '',
    });
    setIsEditMode(true);
  };

  // 체중 기록 수정
  const handleUpdateWeight = async () => {
    try {
      const updateData = {
        petId: pet.petId,
        weightKg: parseFloat(formData.weight),
        measuredDate: formData.date,
        memo: formData.memo || null,
      };

      await updateWeight(selectedWeight.weightId, updateData);
      alert('체중 기록이 수정되었습니다.');
      setIsDetailModalOpen(false);
      setIsEditMode(false);
      fetchWeights();
    } catch (error) {
      console.error('체중 수정 실패:', error);
      alert('체중 수정에 실패했습니다.');
    }
  };

  // 체중 기록 삭제
  const handleDeleteWeight = async () => {
    if (!window.confirm('정말로 이 체중 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteWeight(selectedWeight.weightId);
      alert('체중 기록이 삭제되었습니다.');
      setIsDetailModalOpen(false);
      fetchWeights();
    } catch (error) {
      console.error('체중 삭제 실패:', error);
      alert('체중 삭제에 실패했습니다.');
    }
  };

  // 이상체중 범위 계산 함수
  const getIdealWeightRange = () => {
    if (!pet) return { min: 0, max: 0 };

    const { animalType, breed, age, gender, neutered } = pet;
    let minWeight = 0;
    let maxWeight = 0;

    // 현재 체중 (가장 최신 기록)
    const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : parseFloat(pet.weight) || 0;

    // 품종별 기본 체중 범위 설정
    if (animalType === '강아지') {
      // 소형견 품종들
      if (
        breed &&
        (breed.includes('치와와') ||
          breed.includes('포메') ||
          breed.includes('요크셔') ||
          breed.includes('말티즈') ||
          breed.includes('토이푸들'))
      ) {
        minWeight = 1.5;
        maxWeight = 4.0;
      }
      // 중형견 품종들
      else if (
        breed &&
        (breed.includes('비글') ||
          breed.includes('코커') ||
          breed.includes('불독') ||
          breed.includes('시바') ||
          breed.includes('웰시코기'))
      ) {
        minWeight = 8.0;
        maxWeight = 15.0;
      }
      // 대형견 품종들
      else if (
        breed &&
        (breed.includes('골든') ||
          breed.includes('래브라도') ||
          breed.includes('허스키') ||
          breed.includes('셰퍼드') ||
          breed.includes('도베르만'))
      ) {
        minWeight = 20.0;
        maxWeight = 35.0;
      }
      // 기본값 (품종 미상) - 현재 체중 기반으로 추정
      else {
        if (currentWeight > 0) {
          // 현재 체중의 ±15% 범위를 이상체중으로 설정
          minWeight = currentWeight * 0.85;
          maxWeight = currentWeight * 1.15;
        } else {
          // 체중 기록이 없는 경우 일반적인 범위
          minWeight = 3.0;
          maxWeight = 10.0;
        }
      }
    } else if (animalType === '고양이') {
      // 대형묘 품종
      if (breed && (breed.includes('메인쿤') || breed.includes('랙돌') || breed.includes('노르웨이숲'))) {
        minWeight = 5.0;
        maxWeight = 9.0;
      } else {
        // 일반적인 고양이는 현재 체중 기반으로 계산
        if (currentWeight > 0) {
          // 고양이는 체중 변화 범위가 작으므로 ±10%
          minWeight = currentWeight * 0.9;
          maxWeight = currentWeight * 1.1;
        } else {
          // 체중 기록이 없는 경우 일반적인 범위
          minWeight = 3.0;
          maxWeight = 5.5;
        }
      }
    }

    // 나이별 조정은 최소한으로만 적용
    if (age < 1) {
      // 1살 미만은 성장기이므로 최대값만 약간 조정
      maxWeight *= 0.95;
    }

    // 성별 및 중성화 여부 조정도 최소한으로
    if (neutered === 'Y') {
      // 중성화한 경우 약간의 체중 증가 허용
      maxWeight *= 1.05;
    }

    // 디버깅용 로그
    console.log('Pet info:', { animalType, breed, age, gender, neutered, currentWeight });
    console.log('Calculated ideal weight range:', { min: minWeight, max: maxWeight });

    return {
      min: minWeight.toFixed(1),
      max: maxWeight.toFixed(1),
    };
  };

  // 체중 상태 계산 함수
  const getWeightStatus = () => {
    if (!pet || weights.length === 0) return '측정필요';

    const currentWeight = weights[weights.length - 1]?.weight;
    const { min, max } = getIdealWeightRange();

    if (currentWeight < parseFloat(min) * 0.85) {
      return '저체중';
    } else if (currentWeight >= parseFloat(min) && currentWeight <= parseFloat(max)) {
      return '정상';
    } else if (currentWeight > parseFloat(max) && currentWeight <= parseFloat(max) * 1.15) {
      return '과체중';
    } else {
      return '비만';
    }
  };

  // 체중 상태에 따른 스타일 클래스
  const getWeightStatusClass = (status) => {
    switch (status) {
      case '저체중':
        return styles.statusUnderweight;
      case '정상':
        return styles.statusNormal;
      case '과체중':
        return styles.statusOverweight;
      case '비만':
        return styles.statusObese;
      default:
        return styles.statusUnknown;
    }
  };

  /*
  const chartData = {
    labels: weights.map(w => w.date),
    datasets: [ ... ],
  };
  */

  const idealWeightRange = getIdealWeightRange();
  const weightStatus = getWeightStatus();

  // 페이징 계산
  const totalPages = Math.ceil(weights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWeights = [...weights].reverse().slice(startIndex, endIndex);

  return (
    <>
      <div className={styles.container}>
        {/* 상단: 그래프 및 정보 섹션 */}
        <div className={styles.topSection}>
          <div className={styles.chartSection}>
            <h4 className={styles.sectionTitle}>체중 변화 그래프</h4>
            <LineChart weights={weights} />
          </div>
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>체중 정보</h4>
            <div className={styles.infoCardContainer}>
              <div className={styles.infoCard}>
                <span>현재 체중</span>
                <span className={styles.currentWeight}>
                  {weights.length > 0 ? `${weights[weights.length - 1]?.weight.toFixed(1)}kg` : '-'}
                </span>
              </div>
              <div className={styles.infoCard}>
                <span>정상 체중 범위</span>
                <span>
                  {idealWeightRange.min} - {idealWeightRange.max}kg
                </span>
              </div>
              <div className={styles.infoCard}>
                <span>체중 상태</span>
                <span className={getWeightStatusClass(weightStatus)}>{weightStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 히스토리 섹션 */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h4 className={styles.sectionTitle}>체중 기록 히스토리</h4>
            <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
              + 체중 기록 추가
            </button>
          </div>
          <div className={styles.historyList}>
            {loading ? (
              <div className={styles.loading}>체중 기록을 불러오는 중...</div>
            ) : weights.length > 0 ? (
              // 페이징된 체중 기록 표시
              paginatedWeights.map((w, index) => {
                // 전체 배열에서의 인덱스 계산 (페이징 고려)
                const globalIndex = startIndex + index;
                const prevWeight =
                  globalIndex < weights.length - 1 ? [...weights].reverse()[globalIndex + 1]?.weight : null;
                const change = prevWeight ? w.weight - prevWeight : 0;
                const changeText =
                  change > 0 ? `+${change.toFixed(1)}kg` : change < 0 ? `${change.toFixed(1)}kg` : '유지';

                return (
                  <div
                    key={w.weightId || index}
                    className={styles.historyItem}
                    onClick={() => handleWeightClick(w)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <div className={styles.weightInfo}>
                        <span className={styles.weightValue}>{w.weight.toFixed(1)}kg</span>
                        <span className={styles.weightDate}>{w.date}</span>
                      </div>
                      {/* 메모가 있으면 표시 */}
                      {w.memo && <div className={styles.weightMemo}>{w.memo}</div>}
                    </div>
                    {/* 전체 데이터에서 첫 기록이 아닐 경우에만 변화량 표시 */}
                    {globalIndex < weights.length - 1 && (
                      <span
                        className={`${styles.weightChange} ${change > 0 ? styles.increase : change < 0 ? styles.decrease : ''}`}
                      >
                        {changeText}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>등록된 체중 기록이 없습니다.</p>
                <p>위의 '체중 기록 추가' 버튼을 눌러 첫 번째 기록을 추가해보세요.</p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {weights.length > itemsPerPage && (
            <div className={styles.pagination}>
              <button className={styles.pageButton} onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                처음
              </button>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </button>

              <span className={styles.pageInfo}>
                {currentPage} / {totalPages}
              </span>

              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                마지막
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 공용 모달 사용 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>체중 기록 추가</h2>
        </div>
        <div className={styles.modalContent}>
          <p className={styles.modalSubtitle}>새로운 체중을 기록하세요.</p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>체중(kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="예: 2.8"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>측정일</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>메모 (선택)</label>
            <input
              type="text"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="측정 상황이나 특이사항을 기록하세요"
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.submitButton} onClick={handleSubmit}>
            저장
          </button>
        </div>
      </Modal>

      {/* 체중 기록 상세 보기 모달 */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {selectedWeight && (
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{isEditMode ? '체중 기록 수정' : '체중 기록 상세'}</h2>
            </div>

            <div className={styles.modalContent}>
              {!isEditMode ? (
                // 상세 보기 모드
                <>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>체중</span>
                    <span className={styles.detailValue}>{selectedWeight.weight.toFixed(1)}kg</span>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>측정일</span>
                    <span className={styles.detailValue}>{selectedWeight.date}</span>
                  </div>
                  {selectedWeight.memo && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>메모</span>
                      <p className={styles.detailContent}>{selectedWeight.memo}</p>
                    </div>
                  )}
                </>
              ) : (
                // 수정 모드
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>체중(kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      step="0.1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>측정일</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>메모</label>
                    <input
                      type="text"
                      name="memo"
                      value={formData.memo}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="측정 상황이나 특이사항을 기록하세요"
                    />
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              {!isEditMode ? (
                <>
                  <button
                    className={styles.editButton}
                    onClick={handleEditClick}
                    style={{ position: 'absolute', right: '124px' }}
                  >
                    수정
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={handleDeleteWeight}
                    style={{ position: 'absolute', right: '24px' }}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setIsEditMode(false)}
                    style={{ marginRight: '10px' }}
                  >
                    취소
                  </button>
                  <button className={styles.submitButton} onClick={handleUpdateWeight}>
                    저장
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default Weight;
