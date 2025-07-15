import React, { useState, useEffect, useRef, useContext } from 'react'; // 1. useContext 추가
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider'; // 2. AuthContext 추가
import styles from './NoticeWrite.module.css';

function NoticeUpdate() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [originFileName, setOriginFileName] = useState('');
  const [renameFilename, setRenameFilename] = useState(''); // 기존 renameFilename 저장용
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteFile, setDeleteFile] = useState(false);
  const fileInputRef = useRef();

  // 3. AuthContext에서 필요한 값들을 가져옵니다.
  const { secureApiRequest, isLoggedIn, isAuthLoading } = useContext(AuthContext);

  // 기존 공지사항 데이터 조회
  useEffect(() => {
    // 인증 확인이 끝나기 전까지는 데이터 조회를 보류합니다.
    if (isAuthLoading) {
      return;
    }
    // 관리자만 접근 가능한 페이지이므로, 비로그인 시 접근을 차단합니다.
    if (isLoggedIn === false) {
      alert('접근 권한이 없습니다.');
      navigate('/login');
      return;
    }

    const fetchNotice = async () => {
      setLoading(true);
      setError(null);
      try {
        // 상세 정보 조회는 인증된 사용자가 접근하므로 secureApiRequest 사용을 권장합니다.
        const response = await secureApiRequest(`/notice/${contentId}`);
        const data = response.data;
        setTitle(data.title);
        setContent(data.contentBody);
        setOriginFileName(data.originalFilename || '');
        setRenameFilename(data.renameFilename || ''); // renameFilename도 상태로 관리
      } catch (err) {
        console.error('공지사항 조회 오류:', err);
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [contentId, isLoggedIn, isAuthLoading, navigate, secureApiRequest]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('contentBody', content);
    formData.append('originalFilename', originFileName);
    formData.append('renameFilename', renameFilename); // 상태로 관리하던 renameFilename 전송

    if (file) {
      formData.append('file', file);
    }
    if (deleteFile) {
      formData.append('deleteFlag', 'yes');
    }

    if (!window.confirm('이 내용으로 수정하시겠습니까?')) return;

    try {
      // 4. apiClient.put 대신 secureApiRequest를 사용하여 안전하게 요청합니다.
      await secureApiRequest(`/notice/${contentId}`, {
        method: 'PUT',
        body: formData,
      });

      alert('성공적으로 수정되었습니다.');
      navigate(`/notice/${contentId}`);
    } catch (err) {
      console.error('게시물 수정 중 오류 발생:', err);
      // secureApiRequest가 401 오류를 처리하므로, 여기서는 일반 에러만 처리합니다.
      if (err.response?.status !== 401) {
        alert('수정 중 오류가 발생했습니다.');
      }
    }
  };

  // 인증 확인 중일 때의 UI
  if (isAuthLoading || loading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

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
          <input id="file" type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <button type="button" className={styles.customFileButton} onClick={handleFileButtonClick}>
            파일 선택
          </button>
          <span className={styles.selectedFileName}>
            {file ? `새 파일: ${file.name}` : originFileName ? `현재 파일: ${originFileName}` : '선택된 파일 없음'}
          </span>
          {originFileName && !file && (
            <label style={{ marginLeft: '12px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={deleteFile}
                onChange={(e) => setDeleteFile(e.target.checked)}
                style={{ marginRight: '4px' }}
              />
              파일 삭제
            </label>
          )}
        </div>
        <div className={styles.buttonBar}>
          <button type="submit" className={styles.submitButton}>
            수정
          </button>
          <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoticeUpdate;
