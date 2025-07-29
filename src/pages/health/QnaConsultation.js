import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import { getPetList, getPetImageUrl } from '../../api/petApi';
import { qnaConsultationApi } from '../../api/consultationApi';
import FileUploader from '../../components/common/FileUploader';
import styles from './QnaConsultation.module.css';

function QnaConsultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const vetInfo = location.state?.vetInfo;
  const { userNo, isLoggedIn, secureApiRequest } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    vetId: vetInfo?.vetId || '',
    petId: '',
    title: '',
    content: '',
    category: '건강',
    files: []
  });
  
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // vetInfo가 없으면 전문가 선택 페이지로 이동
  useEffect(() => {
    if (!vetInfo) {
      alert('전문가를 선택해주세요.');
      navigate('/health/expert-consult');
    }
  }, [vetInfo, navigate]);

  // 반려동물 목록 조회
  useEffect(() => {
    if (isLoggedIn && userNo) {
      loadMyPets();
    }
  }, [isLoggedIn, userNo]);

  const loadMyPets = async () => {
    try {
      if (!userNo) {
        return;
      }
      const response = await getPetList(userNo);
      if (response && response.length > 0) {
        setPets(response);
        // 첫 번째 펫을 기본 선택
        if (response.length > 0) {
          setFormData(prev => ({ ...prev, petId: response[0].petId }));
        }
      } else {
        setPets([]);
      }
    } catch (error) {
      console.error('반려동물 목록 조회 실패:', error);
      if (error.response?.status !== 404) {
        // 404(펫 없음)가 아닌 경우에만 에러 처리
      }
      setPets([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (files) => {
    setFormData(prev => ({ ...prev, files }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.petId) {
      newErrors.petId = '반려동물을 선택해주세요.';
    }
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    if (!formData.content.trim()) {
      newErrors.content = '상담 내용을 입력해주세요.';
    }
    if (formData.content.length < 10) {
      newErrors.content = '상담 내용을 10자 이상 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('vetId', vetInfo.vetId);
      formDataToSend.append('petId', formData.petId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      
      // 파일 첨부
      if (formData.files.length > 0) {
        formData.files.forEach(file => {
          formDataToSend.append('files', file);
        });
      }
      
      const response = await qnaConsultationApi.createQnaConsultation(formDataToSend);
      
      if (response && response.data) {
        alert('Q&A 상담이 성공적으로 등록되었습니다.');
        navigate('/mypage/consultations', { state: { activeTab: 'qna' } });
      } else {
        alert(response?.message || 'Q&A 상담 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Q&A 상담 등록 실패:', error);
      alert('Q&A 상담 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Q&A 상담 작성</h2>
        {vetInfo && (
          <p className={styles.subtitle}>
            {vetInfo.name} 수의사님께 상담을 요청합니다
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 반려동물 선택 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            반려동물 선택 <span className={styles.required}>*</span>
          </label>
          <select
            name="petId"
            value={formData.petId}
            onChange={handleChange}
            className={`${styles.select} ${errors.petId ? styles.error : ''}`}
          >
            <option value="">반려동물을 선택하세요</option>
            {pets.map(pet => (
              <option key={pet.petId} value={pet.petId}>
                {pet.petName} ({pet.animalType} / {pet.age}살)
              </option>
            ))}
          </select>
          {errors.petId && <span className={styles.errorMessage}>{errors.petId}</span>}
        </div>

        {/* 카테고리 선택 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>카테고리</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="건강">건강</option>
            <option value="행동">행동</option>
            <option value="영양">영양</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 제목 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            제목 <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.input} ${errors.title ? styles.error : ''}`}
            placeholder="상담 제목을 입력하세요"
            maxLength={100}
          />
          {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
        </div>

        {/* 내용 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            상담 내용 <span className={styles.required}>*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className={`${styles.textarea} ${errors.content ? styles.error : ''}`}
            placeholder="반려동물의 증상이나 궁금한 점을 자세히 작성해주세요.
예시:
- 증상이 시작된 시기
- 증상의 빈도와 정도
- 평소 식습관이나 생활 환경
- 기존 병력이나 복용 중인 약물"
            rows={10}
          />
          {errors.content && <span className={styles.errorMessage}>{errors.content}</span>}
          <div className={styles.charCount}>
            {formData.content.length} / 2000자
          </div>
        </div>

        {/* 파일 첨부 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>파일 첨부</label>
          <FileUploader
            onUploadComplete={handleFileChange}
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
            allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
          />
          <p className={styles.fileHelp}>
            사진, PDF, 문서 파일을 첨부할 수 있습니다. (최대 5개, 각 10MB 이하)
          </p>
        </div>

        {/* 안내 사항 */}
        <div className={styles.notice}>
          <h4>안내 사항</h4>
          <ul>
            <li>Q&A 상담은 실시간 상담이 아닙니다.</li>
            <li>수의사님의 일정에 따라 답변까지 1-2일 정도 소요될 수 있습니다.</li>
            <li>긴급한 상황의 경우 실시간 상담이나 병원 방문을 권장합니다.</li>
            <li>상담료는 {vetInfo?.consultationFee?.toLocaleString() || '30,000'}원입니다.</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.cancelButton}
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? '등록 중...' : 'Q&A 상담 요청'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QnaConsultation;