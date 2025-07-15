import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from 'axios';
import styles from './QnaWrite.module.css';
import { AuthContext } from '../../AuthProvider';

// CSRF 토큰을 쿠키에서 가져오는 헬퍼 함수 (이 부분은 그대로 유지)
function QnaWrite() {
  // 1. AuthContext에서 필요한 함수와 상태를 가져옵니다.
  const { secureApiRequest, authInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // 2. 폼의 상태를 관리합니다.
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // UTF-8 byte 계산 함수
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

  // 3. 폼 제출 시 실행될 핸들러입니다.
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작을 막습니다.

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    // 서버로 보낼 데이터 (JSON 형식)
    const qnaData = {
      title: title,
      contentBody: content,
    };

    try {
      // 4. AuthProvider의 secureApiRequest 함수를 호출합니다.
      // 토큰 관리, 재발급 등 모든 복잡한 처리는 이 함수가 알아서 해줍니다.
      await secureApiRequest('/qna', {
        method: 'POST',
        body: qnaData,
      });

      alert('문의글이 성공적으로 등록되었습니다.');
      navigate('/qna'); // 문의글 목록 페이지로 이동 (경로는 실제에 맞게 수정)
    } catch (error) {
      console.error('문의글 등록 실패:', error);
      alert('문의글 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  if (authInfo && authInfo.isLoggedIn === false) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>문의글 작성</h2>
        <div style={{textAlign: 'center', color: '#888', fontSize: '1.1rem', margin: '40px 0'}}>
          1:1 문의는 로그인 후 이용 가능합니다.<br />
          <button className={styles.submitButton} style={{marginTop: '24px'}} onClick={() => navigate('/login')}>로그인 하러 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>문의글 작성</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.input}
          />
          <div className={styles.charCount}>
            {getUtf8Bytes(title)} / 1000 byte
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className={styles.textarea}
            rows={8}
          />
          <div className={styles.charCount}>
            {content.length} 글자
          </div>
        </div>
        <div className={styles.buttonBar}>
          <button type="submit" className={styles.submitButton}>
            등록
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate(-1)} // 이전 페이지로 이동
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default QnaWrite;
