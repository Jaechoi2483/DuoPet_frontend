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
  const [deleteFile, setDeleteFile] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/notice/${contentId}`);
        console.log('서버로부터 받은 데이터:', response.data);
        setTitle(response.data.title);
        setContent(response.data.contentBody);
        setOriginFileName(response.data.originalFilename || '');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('title', title);
    formData.append('contentBody', content);
    formData.append('originalFilename', originFileName);
    formData.append('renameFilename', '기존 rename 값'); // DB에서 불러온 기존 renameFilename 값

    // 새 파일이 있으면 추가
    if (file) {
      formData.append('file', file);
    }

    if (deleteFile) {
      formData.append('deleteFlag', 'yes');
    }

    if (!window.confirm('이 내용으로 수정하시겠습니까?')) return;

    try {
      await apiClient.put(`/notice/${contentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('성공적으로 수정되었습니다.');
      navigate(`/notice/${contentId}`);
    } catch (err) {
      console.error('게시물 수정 중 오류 발생:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  console.log('렌더링 직전 originFileName state:', originFileName);
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
          {originFileName && !file && (
            <div className={styles.fileInfo}>
              <span>현재 파일: {originFileName}</span>
              <label>
                <input
                  type="checkbox"
                  checked={deleteFile}
                  onChange={(e) => setDeleteFile(e.target.checked)}
                />
                파일 삭제
              </label>
            </div>
          )}
          {file && <span>새 파일: {file.name}</span>}
        </div>
        <div className={styles.buttonBar}>
          <button type="submit" className={styles.submitButton}>
            수정
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate(-1)}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoticeUpdate;
