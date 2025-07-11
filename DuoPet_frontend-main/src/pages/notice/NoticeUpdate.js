import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../utils/axios';
import styles from './NoticeWrite.module.css';

function NoticeUpdate() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [originFileName, setOriginFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/notice/${contentId}`);
        setTitle(response.data.title);
        setContent(response.data.contentBody);
        setOriginFileName(response.data.fileName || '');
      } catch (err) {
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [contentId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 연동
    alert('수정 완료! (실제 저장은 미구현)');
    navigate(-1);
  };

  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공지사항 수정</h2>
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
        <div className={styles.formGroup}>
          <label htmlFor="file">첨부파일</label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            className={styles.input}
          />
          <div className={styles.fileName}>
            {file ? file.name : originFileName}
          </div>
        </div>
        <div className={styles.buttonBar}>
          <button type="submit" className={styles.submitButton}>수정</button>
          <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default NoticeUpdate; 