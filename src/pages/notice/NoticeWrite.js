import React, { useState, useEffect, useContext, useRef } from 'react'; // 1. useContext 추가
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider'; // 2. AuthContext 추가
import styles from './NoticeWrite.module.css';

function NoticeWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  // 3. AuthContext에서 필요한 모든 값을 가져옵니다.
  const { userNo, role, isLoggedIn, isAuthLoading, secureApiRequest } = useContext(AuthContext);

  // 4. 인증 및 권한 확인 로직 추가
  useEffect(() => {
    // 인증 상태 확인이 끝나기 전까지는 대기
    if (isAuthLoading) {
      return;
    }
    // 비로그인 상태이거나, 관리자(admin)가 아니면 접근 차단
    if (!isLoggedIn || role !== 'admin') {
      alert('공지사항 작성 권한이 없습니다.');
      navigate(-1); // 이전 페이지로 이동
    }
  }, [isLoggedIn, isAuthLoading, role, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
    e.target.value = '';
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !contentBody.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('contentBody', contentBody);
    formData.append('contentType', 'notice');

    // 5. 하드코딩된 ID 대신, AuthContext에서 가져온 실제 사용자 ID(userNo)를 사용합니다.
    formData.append('userId', userNo);

    if (file) {
      formData.append('ofile', file);
    }

    try {
      // 6. apiClient.post 대신 secureApiRequest를 사용하여 안전하게 요청합니다.
      await secureApiRequest('/admin/notice', {
        method: 'POST',
        body: formData,
      });

      alert('공지사항이 성공적으로 등록되었습니다.');
      navigate('/notice'); // 공지사항 목록 페이지로 이동
    } catch (error) {
      console.error('공지사항 등록 중 오류 발생:', error);
      // secureApiRequest가 401 오류를 처리하므로, 여기서는 일반 에러만 처리합니다.
      if (error.response?.status !== 401) {
        alert('등록 중 오류가 발생했습니다.');
      }
    }
  };

  // UTF-8 byte 계산 함수 (기존과 동일)
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

  // 인증 확인 중이거나 권한이 없는 경우, 렌더링을 막아 화면 깜빡임 방지
  if (isAuthLoading || !isLoggedIn || role !== 'admin') {
    return <div className={styles.container}>권한을 확인 중입니다...</div>;
  }

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
          <div className={styles.charCount}>{getUtf8Bytes(title)} / 1000 byte</div>
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
          <div className={styles.charCount}>{contentBody.length} 글자</div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="files">첨부파일</label>
          <input id="files" type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <button type="button" className={styles.customFileButton} onClick={handleFileButtonClick}>
            파일 선택
          </button>
          <span className={styles.selectedFileName}>{file ? file.name : '선택된 파일 없음'}</span>
        </div>
        <div className={styles.buttonBar}>
          <button type="submit" className={styles.submitButton}>
            등록
          </button>
          <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoticeWrite;
