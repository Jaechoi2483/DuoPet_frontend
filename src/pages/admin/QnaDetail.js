import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios';
import styles from './QnaDetail.module.css';

// JWT 토큰의 payload를 디코딩하는 헬퍼 함수
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function QnaDetail() {
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [qna, setQna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 수정된 상태 ---
  const [isAdmin, setIsAdmin] = useState(false); // 기본값을 false로 설정
  const [newAnswer, setNewAnswer] = useState('');
  // answerTab 관련 상태 제거

  // --- 추가된 useEffect (사용자 역할 확인용) ---
  useEffect(() => {
    // ❗ 로컬 스토리지에 저장된 토큰의 key 이름으로 변경하세요.
    const token = localStorage.getItem('accessToken');

    if (token) {
      const decoded = parseJwt(token);
      // ❗ 토큰 payload에 역할 정보가 담긴 key 이름(예: 'role')과
      // ❗ 관리자를 나타내는 값(예: 'ADMIN')으로 변경하세요.
      if (decoded && decoded.role === 'admin') {
        setIsAdmin(true);
      }
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const fetchQnaDetail = async () => {
    // ... (이전과 동일)
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/qna/${contentId}`);
      setQna(response.data);
    } catch (err) {
      setError(err);
      console.error('Q&A 상세 정보 조회 중 오류 발생:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contentId) {
      fetchQnaDetail();
    }
  }, [contentId]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();

    if (!newAnswer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await apiClient.post(`/qna/${contentId}/answer`, {
        content: newAnswer,
      });

      if (response.status === 201 || response.status === 200) {
        alert('답변이 성공적으로 등록되었습니다.');
        setNewAnswer('');
        // 답변 등록 후 데이터 새로고침
        fetchQnaDetail();
      } else {
        alert('답변 등록에 실패했습니다. (상태 코드: ' + response.status + ')');
      }
    } catch (error) {
      console.error('답변 등록 중 오류 발생:', error);

      // ⭐️ 이 부분을 수정해야 합니다.
      if (error && error.response) {
        // error 객체가 존재하고, 그 안에 response 속성이 있는지 안전하게 확인
        console.error('서버 응답 상태:', error.response.status);
        console.error('서버 응답 데이터:', error.response.data);
        alert(
          `답변 등록 실패: ${error.response.data || error.response.statusText}`
        );
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 문제 등)
        console.error('요청은 보냈지만 응답을 받지 못했습니다:', error.request);
        alert('답변 등록 실패: 서버 응답 없음 (네트워크 문제 또는 CORS 오류)');
      } else {
        // 그 외 알 수 없는 오류
        console.error('Axios 오류가 아닌 다른 오류:', error.message);
        alert('답변 등록 실패: 알 수 없는 오류 발생');
      }
    }
  };

  // ... (이하 렌더링 로직은 이전과 동일)
  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error) return <div className={styles.container}>오류 발생</div>;
  if (!qna) return <div className={styles.container}>게시물 없음</div>;

  const hasAnswer = qna.answers && qna.answers.length > 0;

  console.log('--- 디버깅 정보 ---');
  console.log('게시물에 답변이 있나? (hasAnswer):', hasAnswer);
  console.log('관리자 인가? (isAdmin):', isAdmin);
  console.log('--------------------');
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{qna.title}</h2>
      {/* ... (질문 내용은 동일) ... */}
      <div className={styles.content}>{qna.contentBody}</div>

      {/* 답변이 있으면 답변만 보여줌 */}
      {hasAnswer && (
        <div className={styles.answerSection}>
          <div className={styles.answerTabBar} style={{ display: 'none' }} />{' '}
          {/* 탭 바 완전 제거 */}
          {qna.answers.map((answer) => (
            <div key={answer.commentId} className={styles.answerBox}>
              <div className={styles.answerInfo}>
                <span>답변 작성자 ID: {answer.userId}</span>{' '}
                <span>
                  답변 작성일: {new Date(answer.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.answer}>{answer.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* 답변이 없고, 관리자인 경우 답변 작성 폼만 보여줌 */}
      {!hasAnswer && isAdmin && (
        <div className={styles.answerSection}>
          <div className={styles.answerWriteBox}>
            <div className={styles.answerWriteTitle}>
              <span role="img" aria-label="edit">
                📝
              </span>
              답변 작성
            </div>
            <textarea
              className={styles.answerTextarea}
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="답변을 입력하세요..."
            />
            <button
              className={styles.submitButton}
              onClick={handleAnswerSubmit}
            >
              답변 등록
            </button>
          </div>
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
