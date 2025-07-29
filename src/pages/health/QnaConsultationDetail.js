import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import { qnaConsultationApi } from '../../api/consultationApi';
import { getPetImageUrl } from '../../api/petApi';
import Loading from '../../components/common/Loading';
import FileUploader from '../../components/common/FileUploader';
import styles from './QnaConsultationDetail.module.css';

function QnaConsultationDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { userNo, role, isLoggedIn } = useContext(AuthContext);
  
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [answerFiles, setAnswerFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn && roomId) {
      loadConsultationDetail();
    }
  }, [isLoggedIn, roomId]);
  
  // 권한 체크 로그 (디버깅용 - 한 번만 실행)
  useEffect(() => {
    if (consultation) {
      console.log('권한 체크:', {
        userRole: localStorage.getItem('userRole'),
        userId: localStorage.getItem('userId'),
        consultationVetId: consultation.vetId,
        consultationUserId: consultation.userId
      });
    }
  }, [consultation]);

  const loadConsultationDetail = async () => {
    try {
      console.log('Q&A 상담 상세 조회 요청 - roomId:', roomId);
      const response = await qnaConsultationApi.getQnaConsultationDetail(roomId);
      console.log('Q&A 상담 상세 응답:', response);
      
      if (response && response.data) {
        console.log('상담 상세 데이터:', response.data);
        console.log('반려동물 정보:', {
          name: response.data.petName,
          species: response.data.petSpecies,
          age: response.data.petAge,
          gender: response.data.petGender
        });
        console.log('메시지 목록:', response.data.messages);
        console.log('USER TEXT 메시지:', response.data.messages?.filter(msg => msg.senderType === 'USER' && msg.messageType === 'TEXT'));
        console.log('주 질문 메시지:', response.data.messages?.filter(msg => msg.isMainQuestion));
        setConsultation(response.data);
      } else {
        console.error('응답에 데이터가 없습니다:', response);
        alert('상담 정보를 불러올 수 없습니다.');
        navigate(-1);
      }
    } catch (error) {
      console.error('상담 상세 조회 실패:', error);
      console.error('에러 상세:', error.response);
      alert('상담 정보를 불러오는 중 오류가 발생했습니다.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', answerContent);
      
      if (answerFiles.length > 0) {
        answerFiles.forEach(file => {
          formData.append('files', file);
        });
      }
      
      // 디버깅: FormData 내용 확인
      console.log('답변 등록 요청:', {
        roomId,
        content: answerContent,
        filesCount: answerFiles.length,
        accessToken: localStorage.getItem('accessToken') ? '있음' : '없음'
      });
      
      const response = await qnaConsultationApi.createAnswer(roomId, formData);
      
      if (response && response.data) {
        alert('답변이 성공적으로 등록되었습니다.');
        loadConsultationDetail(); // 페이지 새로고침
        setShowAnswerForm(false);
        setAnswerContent('');
        setAnswerFiles([]);
      } else {
        alert(response?.message || '답변 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 등록 실패:', error);
      console.error('에러 상세:', error.response);
      
      if (error.response?.status === 400) {
        alert(error.response?.data?.message || '입력 데이터를 확인해주세요.');
      } else if (error.response?.status === 401) {
        alert('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (error.response?.status === 403) {
        alert('해당 상담에 답변할 권한이 없습니다.');
      } else {
        alert('답변 등록 중 오류가 발생했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="상담 정보를 불러오는 중..." />;
  }

  if (!consultation) {
    return <div className={styles.error}>상담 정보를 찾을 수 없습니다.</div>;
  }

  // localStorage에서 userId 가져오기
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  
  // 수의사 여부 확인 (role이 'vet'인지 확인)
  const isVet = userRole === 'vet';
  const isOwner = consultation.userId === parseInt(userId);
  
  // 답변 가능 여부 확인
  const canAnswer = isVet && 
    ((consultation.roomStatus || consultation.status) === 'CREATED' || 
     (consultation.roomStatus || consultation.status) === 'PENDING' ||
     (consultation.roomStatus || consultation.status) === 'WAITING');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => {
            // 마이페이지로 이동하면서 상담내역 탭을 활성화하고, 
            // ConsultationHistory 컴포넌트에도 qna 탭을 활성화하도록 전달
            navigate('/mypage', { 
              state: { 
                activeTab: 'consultations',  // 마이페이지의 상담내역 탭
                consultationTab: 'qna'       // 상담내역 내의 Q&A 탭
              } 
            });
          }} 
          className={styles.backButton}
        >
          ← 목록으로
        </button>
        <h2 className={styles.title}>Q&A 상담 상세</h2>
      </div>

      {/* 상담 기본 정보 */}
      <div className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>상태</label>
            <span className={`${styles.status} ${styles[(consultation.roomStatus || consultation.status || '').toLowerCase()]}`}>
              {(consultation.roomStatus || consultation.status) === 'CREATED' || (consultation.roomStatus || consultation.status) === 'PENDING' ? '답변 대기' : '답변 완료'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <label>카테고리</label>
            <span>{consultation.category || '기타'}</span>
          </div>
          <div className={styles.infoItem}>
            <label>작성일</label>
            <span>{new Date(consultation.createdAt).toLocaleDateString()}</span>
          </div>
          {consultation.hasAnswer && (
            <div className={styles.infoItem}>
              <label>답변 상태</label>
              <span>답변 완료</span>
            </div>
          )}
        </div>
      </div>

      {/* 반려동물 정보 */}
      <div className={styles.petSection}>
        <h3>반려동물 정보</h3>
        <div className={styles.petInfo}>
          {consultation.petImage && (
            <img 
              src={getPetImageUrl(consultation.petImage)} 
              alt={consultation.petName} 
              className={styles.petImage}
            />
          )}
          <div>
            <p><strong>{consultation.petName || '이름 없음'}</strong></p>
            <p>
              {consultation.petSpecies || '품종 정보 없음'} / 
              {consultation.petAge ? `${consultation.petAge}살` : '나이 정보 없음'} / 
              {consultation.petGender || '성별 정보 없음'}
            </p>
          </div>
        </div>
      </div>

      {/* 질문 내용 */}
      <div className={styles.questionSection}>
        <h3>질문 내용</h3>
        <h4 className={styles.questionTitle}>{consultation.title}</h4>
        <div className={styles.content}>
          {/* USER의 TEXT 메시지 표시 */}
          {consultation.messages && consultation.messages
            .filter(msg => msg.senderType === 'USER' && msg.messageType === 'TEXT')
            .map((question, index) => (
              <div key={`q-${index}`}>
                {question.content}
              </div>
            ))}
          
          {/* 메시지가 없는 경우 */}
          {(!consultation.messages || 
            consultation.messages.filter(msg => msg.senderType === 'USER' && msg.messageType === 'TEXT').length === 0) && (
            <p>등록된 질문 내용이 없습니다.</p>
          )}
        </div>
        
        {/* 첨부 파일 */}
        {consultation.messages && consultation.messages
          .filter(msg => msg.senderType === 'USER' && msg.messageType !== 'TEXT' && msg.fileName)
          .length > 0 && (
          <div className={styles.files}>
            <h4>첨부 파일</h4>
            <div className={styles.fileList}>
              {consultation.messages
                .filter(msg => msg.senderType === 'USER' && msg.messageType !== 'TEXT' && msg.fileName)
                .map((file, index) => (
                  <a 
                    key={`f-${index}`}
                    href={`${process.env.REACT_APP_API_BASE_URL}${file.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileItem}
                  >
                    {file.fileName}
                  </a>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 답변 내용 */}
      {consultation.messages && consultation.messages.filter(msg => msg.senderType === 'VET' && msg.messageType === 'TEXT').length > 0 && (
        <div className={styles.answerSection}>
          <h3>수의사 답변</h3>
          <div className={styles.vetInfo}>
            <strong>{consultation.vetName}</strong> 수의사
            <span className={styles.specialty}>{consultation.vetSpecialty}</span>
          </div>
          {consultation.messages
            .filter(msg => msg.senderType === 'VET' && msg.messageType === 'TEXT')
            .map((answer, index) => (
              <div key={index}>
                <div className={styles.content}>
                  {answer.content}
                </div>
                {consultation.messages
                  .filter(msg => msg.senderType === 'VET' && msg.messageType !== 'TEXT' && msg.fileName)
                  .map((file, fileIndex) => (
                    <div key={`file-${fileIndex}`} className={styles.files}>
                      <h4>첨부 파일</h4>
                      <div className={styles.fileList}>
                        <a 
                          href={`${process.env.REACT_APP_API_BASE_URL}${file.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.fileItem}
                        >
                          {file.fileName}
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      )}

      {/* 답변 작성 폼 (수의사용) */}
      {canAnswer && !showAnswerForm && (
        <div className={styles.actionSection}>
          <button 
            className={styles.answerButton}
            onClick={() => setShowAnswerForm(true)}
          >
            답변 작성
          </button>
        </div>
      )}

      {canAnswer && showAnswerForm && (
        <form onSubmit={handleAnswerSubmit} className={styles.answerForm}>
          <h3>답변 작성</h3>
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            className={styles.textarea}
            placeholder="상담 답변을 작성해주세요..."
            rows={10}
            required
          />
          <div className={styles.fileUpload}>
            <FileUploader
              onUploadComplete={setAnswerFiles}
              maxFiles={3}
              maxSize={10 * 1024 * 1024}
              allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
            />
          </div>
          <div className={styles.formButtons}>
            <button
              type="button"
              onClick={() => {
                setShowAnswerForm(false);
                setAnswerContent('');
                setAnswerFiles([]);
              }}
              className={styles.cancelButton}
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? '등록 중...' : '답변 등록'}
            </button>
          </div>
        </form>
      )}

      {/* 추가 질문/답변 영역 (추후 구현) */}
      {consultation.status === 'ANSWERED' && (isOwner || isVet) && (
        <div className={styles.additionalSection}>
          <p className={styles.notice}>
            추가 질문 기능은 준비 중입니다.
          </p>
        </div>
      )}
    </div>
  );
}

export default QnaConsultationDetail;