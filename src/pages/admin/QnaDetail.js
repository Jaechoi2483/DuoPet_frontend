import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios';
import styles from './QnaDetail.module.css';

function QnaDetail() {
  // 1. 모든 로직은 QnaDetail 함수 안에서 실행되어야 합니다.
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [qna, setQna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contentId) return;

    const fetchQnaDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✨ 2 & 3. API 경로와 변수명 수정
        const response = await apiClient.get(`/qna/${contentId}`);
        setQna(response.data);
      } catch (err) {
        setError(err);
        console.error('Q&A 상세 정보 조회 중 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQnaDetail();
  }, [contentId]); // ✨ 2. 변수명 수정

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>;
  }
  if (error) {
    return (
      <div className={styles.container}>
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }
  if (!qna) {
    return <div className={styles.container}>게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{qna.title}</h2>
      <div className={styles.info}>
        <span>작성자 ID: {qna.userId}</span>
        <span>작성일: {new Date(qna.createdAt).toLocaleDateString()}</span>
      </div>
      <div className={styles.content}>{qna.contentBody}</div>
      {qna.answers && qna.answers.length > 0 && (
        <div className={styles.answerSection}>
          <strong>답변</strong>
          <div className={styles.answerInfo}>
            {/* 답변이 하나이므로 배열의 첫 번째 항목([0])을 사용합니다. */}
            <span>답변 작성자 ID: {qna.answers[0].userId}</span>
            <span>
              답변 작성일:{' '}
              {new Date(qna.answers[0].createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className={styles.answer}>{qna.answers[0].contentBody}</div>
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
