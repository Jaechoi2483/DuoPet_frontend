import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios';
import styles from './NoticeWrite.module.css';

function NoticeWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [file, setFile] = useState(null);
  const [fileMessage, setFileMessage] = useState('1개만 첨부 가능합니다.');
  const [showError, setShowError] = useState(false);
  const fileInputRef = React.useRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
    // 파일 선택 후 input 값을 초기화하여 같은 파일을 다시 선택할 수 있도록 함
    e.target.value = '';
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FormData 객체 생성
    const formData = new FormData();

    // DTO 필드에 맞춰 데이터를 추가합니다.
    // 백엔드 @ModelAttribute Notice notice가 받을 수 있도록 key를 맞춰줍니다.
    formData.append('title', title);
    formData.append('contentBody', contentBody);
    formData.append('contentType', 'notice'); // 공지사항 타입 지정
    formData.append('userId', 1); // TODO: 실제 로그인된 사용자 ID로 변경해야 함

    // 파일이 있으면 FormData에 추가합니다.
    // 백엔드 @RequestParam(name="ofile")에 맞춰 key를 "ofile"로 지정합니다.
    if (file) {
      formData.append('ofile', file);
    }

    try {
      // apiClient를 사용해 서버로 POST 요청
      await apiClient.post('/admin/notice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Axios가 자동으로 설정하지만 명시적으로 추가 가능
        },
      });

      alert('공지사항이 성공적으로 등록되었습니다.');
      navigate(-1); // 목록 페이지로 이동
    } catch (error) {
      console.error('공지사항 등록 중 오류 발생:', error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공지사항 작성</h2>
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
            value={contentBody}
            onChange={(e) => setContentBody(e.target.value)}
            required
            className={styles.textarea}
            rows={8}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="files">첨부파일</label>
          <input
            id="files"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className={styles.customFileButton}
            onClick={handleFileButtonClick}
          >
            파일 선택
          </button>
          <span className={styles.selectedFileName}>
            {file ? file.name : '선택된 파일 없음'}
          </span>
        </div>
        <div className={styles.buttonBar}>
          <button type="submit" className={styles.submitButton}>
            등록
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

export default NoticeWrite;
