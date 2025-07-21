import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './QnaDetail.module.css';
import { AuthContext } from '../../AuthProvider';

// [신규] 날짜 형식을 안전하게 처리하는 헬퍼 함수
const formatDisplayDate = (dateInput) => {
  if (!dateInput) {
    return '날짜 정보 없음';
  }

  let date;
  // 1. 입력값이 배열인 경우 (LocalDateTime)
  if (Array.isArray(dateInput)) {
    const [year, month, day] = dateInput;
    // JavaScript의 Date는 월(month)을 0부터 시작하므로 1을 빼줍니다.
    date = new Date(year, month - 1, day);
  } else {
    // 2. 문자열이나 다른 형식인 경우
    date = new Date(dateInput);
  }

  // 3. 최종 유효성 검사
  if (isNaN(date.getTime())) {
    return '날짜 형식 오류';
  }

  return date.toLocaleDateString('ko-KR');
};

function QnaDetail({ contentId: propContentId, onBack, isAdminView }) {
  const params = useParams();
  const contentId = propContentId || params.contentId;
  const navigate = useNavigate();

  const { isLoggedIn, role, isAuthLoading, secureApiRequest } = useContext(AuthContext);

  const [qna, setQna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const fetchQnaDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await secureApiRequest(`/qna/${contentId}`);
        setQna(response.data);
      } catch (err) {
        console.error('Q&A 상세 정보 조회 중 오류 발생:', err);
        if (err.response?.status !== 401) {
          setError('게시물을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQnaDetail();
  }, [contentId, isLoggedIn, isAuthLoading, navigate, secureApiRequest]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      await secureApiRequest(`/qna/${contentId}/answer`, {
        method: 'POST',
        body: { content: newAnswer },
      });

      alert('답변이 성공적으로 등록되었습니다.');
      setNewAnswer('');
      const response = await secureApiRequest(`/qna/${contentId}`);
      setQna(response.data);
    } catch (error) {
      console.error('답변 등록 중 오류 발생:', error);
      if (error.response?.status !== 401) {
        alert(`답변 등록 실패: ${error.response?.data?.message || '서버 오류'}`);
      }
    }
  };

  function getUtf8Bytes(str) {
    if (!str) return 0;
    let bytes = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code <= 0x7f) bytes += 1;
      else if (code <= 0x7ff) bytes += 2;
      else if (code <= 0xffff) bytes += 3;
      else bytes += 4;
    }
    return bytes;
  }

  if (isAuthLoading) {
    return <div className={styles.container}>사용자 정보를 확인 중입니다...</div>;
  }
  if (loading) {
    return <div className={styles.container}>데이터를 불러오는 중...</div>;
  }
  if (error) {
    return <div className={styles.container}>{error}</div>;
  }
  if (!qna) {
    return <div className={styles.container}>문의 내역을 찾을 수 없습니다.</div>;
  }

  const hasAnswer = qna.answers && qna.answers.length > 0;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{qna.title}</h2>
      <div className={styles.info}>
        <span>작성자 ID: {qna.userId}</span>
        {/* [수정] formatDisplayDate 함수 사용 */}
        <span>작성일: {formatDisplayDate(qna.createdAt)}</span>
      </div>
      <div className={styles.content}>{qna.contentBody}</div>

      {hasAnswer && (
        <div className={styles.answerSection}>
          {qna.answers.map((answer) => (
            <div key={answer.commentId} className={styles.answerBox}>
              <div className={styles.answerInfo}>
                <span>답변 작성자: 관리자</span>
                {/* [수정] formatDisplayDate 함수 사용 */}
                <span>답변 작성일: {formatDisplayDate(answer.createdAt)}</span>
              </div>
              <div className={styles.answer}>{answer.content}</div>
            </div>
          ))}
        </div>
      )}

      {!hasAnswer && isAdmin && (
        <div className={styles.answerSection}>
          <form
            className={`${styles.answerWriteBox} ${styles.answerWriteBoxReset}`}
            onSubmit={handleAnswerSubmit}
          >
            <div
              className={`${styles.answerWriteTitle} ${styles.answerWriteTitleReset}`}
            >
              답변 작성
            </div>
            <textarea
              className={`${styles.answerTextarea} ${styles.answerTextareaReset}`}
              value={newAnswer}
              onChange={(e) => {
                let val = e.target.value;
                let bytes = getUtf8Bytes(val);
                while (bytes > 255) {
                  val = val.slice(0, -1);
                  bytes = getUtf8Bytes(val);
                }
                setNewAnswer(val);
              }}
              placeholder="답변을 입력하세요..."
              required
            />
            <div className={styles.answerByteInfo}>
              {getUtf8Bytes(newAnswer)} / 255 byte
            </div>
            <button
              type="submit"
              className={`${styles.submitButton} ${styles.submitButtonReset}`}
            >
              답변 등록
            </button>
          </form>
        </div>
      )}

      <div className={styles.buttonBar}>
        <button
          className={styles.listButton}
          onClick={() => {
            if (isAdminView && onBack) {
              onBack();
            } else {
              navigate(-1);
            }
          }}
        >
          목록으로
        </button>
      </div>
    </div>
  );
}

export default QnaDetail;
