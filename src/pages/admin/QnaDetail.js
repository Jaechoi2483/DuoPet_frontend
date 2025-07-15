import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './QnaDetail.module.css';
import { AuthContext } from '../../AuthProvider'; // 1. AuthContext를 import 합니다.

function QnaDetail() {
  const { contentId } = useParams();
  const navigate = useNavigate();

  // 2. AuthContext에서 필요한 모든 상태와 함수를 가져옵니다.
  const { isLoggedIn, role, isAuthLoading, secureApiRequest } = useContext(AuthContext);

  const [qna, setQna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');

  // 3. 관리자 여부를 Context의 role 상태로 안전하게 판단합니다.
  const isAdmin = role === 'admin';

  // --- 데이터 조회 로직 ---
  useEffect(() => {
    // 인증 상태 확인이 끝나기 전까지는 API를 호출하지 않습니다.
    if (isAuthLoading) {
      return;
    }
    // Q&A 상세 보기는 로그인이 필수이므로, 비로그인 시 접근을 차단합니다.
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const fetchQnaDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // 4. secureApiRequest를 사용하여 안전하게 데이터를 조회합니다.
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

  // --- 답변 등록 핸들러 ---
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      // 5. secureApiRequest를 사용하여 안전하게 답변을 등록합니다.
      await secureApiRequest(`/qna/${contentId}/answer`, {
        method: 'POST',
        // secureApiRequest는 객체를 자동으로 JSON 문자열로 변환해줍니다.
        body: { content: newAnswer },
      });

      alert('답변이 성공적으로 등록되었습니다.');
      setNewAnswer('');
      // 답변 등록 후 데이터를 새로고침하기 위해 다시 조회 함수를 호출합니다.
      // 이 부분은 개선의 여지가 있으나, 현재 구조에서는 가장 직관적인 방식입니다.
      const response = await secureApiRequest(`/qna/${contentId}`);
      setQna(response.data);
    } catch (error) {
      console.error('답변 등록 중 오류 발생:', error);
      if (error.response?.status !== 401) {
        alert(`답변 등록 실패: ${error.response?.data?.message || '서버 오류'}`);
      }
    }
  };

  // UTF-8 byte 계산 함수 추가
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

  // --- 렌더링 로직 ---

  // 1. 인증 확인 중일 때의 UI
  if (isAuthLoading) {
    return <div className={styles.container}>사용자 정보를 확인 중입니다...</div>;
  }
  // 2. 데이터 로딩 중일 때의 UI
  if (loading) {
    return <div className={styles.container}>데이터를 불러오는 중...</div>;
  }
  // 3. 에러 발생 시의 UI
  if (error) {
    return <div className={styles.container}>{error}</div>;
  }
  // 4. 데이터가 없을 때의 UI
  if (!qna) {
    return <div className={styles.container}>문의 내역을 찾을 수 없습니다.</div>;
  }

  const hasAnswer = qna.answers && qna.answers.length > 0;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{qna.title}</h2>
      <div className={styles.info}>
        <span>작성자 ID: {qna.userId}</span>
        <span>작성일: {new Date(qna.createdAt).toLocaleDateString()}</span>
      </div>
      <div className={styles.content}>{qna.contentBody}</div>

      {/* 답변이 있으면 답변을 보여줌 */}
      {hasAnswer && (
        <div className={styles.answerSection}>
          {qna.answers.map((answer) => (
            <div key={answer.commentId} className={styles.answerBox}>
              <div className={styles.answerInfo}>
                <span>답변 작성자: 관리자</span>
                <span>답변 작성일: {new Date(answer.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.answer}>{answer.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* 답변이 없고, 현재 사용자가 관리자일 경우에만 답변 작성 폼을 보여줌 */}
      {!hasAnswer && isAdmin && (
        <div className={styles.answerSection}>
          <form className={styles.answerWriteBox} onSubmit={handleAnswerSubmit} style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0, gap: 6 }}>
            <div className={styles.answerWriteTitle} style={{ color: '#1976d2', fontWeight: 400, fontSize: '1rem', marginBottom: 2 }}>
              답변 작성
            </div>
            <textarea
              className={styles.answerTextarea}
              value={newAnswer}
              onChange={(e) => {
                let val = e.target.value;
                // 255byte 초과 시 자동으로 자르기
                let bytes = getUtf8Bytes(val);
                while (bytes > 255) {
                  val = val.slice(0, -1);
                  bytes = getUtf8Bytes(val);
                }
                setNewAnswer(val);
              }}
              placeholder="답변을 입력하세요..."
              required
              style={{ minHeight: 60, borderRadius: 4, border: '1px solid #e0e7ef', fontSize: '1rem', fontWeight: 400, background: 'none', color: '#222', padding: '8px', boxShadow: 'none' }}
            />
            <div style={{ textAlign: 'right', color: '#888', fontSize: '12px', marginTop: '2px' }}>
              {getUtf8Bytes(newAnswer)} / 255 byte
            </div>
            <button type="submit" className={styles.submitButton} style={{ minWidth: 100, fontWeight: 400, fontSize: '1rem', padding: '7px 18px', borderRadius: 4, border: '1.2px solid #1976d2', background: 'none', color: '#1976d2', boxShadow: 'none' }}>
              답변 등록
            </button>
          </form>
        </div>
      )}

      <div className={styles.buttonBar}>
        <button className={styles.listButton} onClick={() => navigate(-1)}>
          목록으로
        </button>
      </div>
    </div>
  );
}

export default QnaDetail;
