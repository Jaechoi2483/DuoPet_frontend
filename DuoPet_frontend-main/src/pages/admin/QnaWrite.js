import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QnaWrite.module.css';

function QnaWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 연동
    alert('문의글이 등록되었습니다! (실제 저장은 미구현)');
    navigate(-1);
  };

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
        </div>
        <div className={styles.buttonBar}>
          <button type="submit" className={styles.submitButton}>등록</button>
          <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default QnaWrite; 