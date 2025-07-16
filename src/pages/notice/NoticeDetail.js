import React, { useState, useEffect, useContext } from 'react'; // 1. useContext 추가
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './NoticeDetail.module.css';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider'; // 2. AuthContext 추가

function NoticeDetail({ contentId: propContentId, onBack, isAdminView }) {
  const params = useParams();
  const contentId = propContentId || params.contentId;
  const navigate = useNavigate();
  const location = useLocation();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. AuthContext에서 필요한 모든 값을 가져옵니다.
  const { isLoggedIn, role, secureApiRequest } = useContext(AuthContext);

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        // 상세 정보 조회는 공개 API이므로 일반 apiClient 사용
        const response = await apiClient.get(`/notice/${contentId}`);
        setNotice(response.data);
      } catch (err) {
        setError(err);
        console.error('공지사항 상세 정보를 불러오는 중 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticeDetail();
  }, [contentId]);

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      // 4. apiClient.delete 대신 secureApiRequest를 사용하여 안전하게 요청합니다.
      await secureApiRequest(`/notice/${contentId}`, {
        method: 'DELETE',
      });
      alert('공지사항이 삭제되었습니다.');
      navigate('/notice');
    } catch (err) {
      console.error('삭제 중 오류 발생:', err);
      if (err.response?.status !== 401) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 5. 인증된 요청으로 파일을 다운로드하는 새로운 함수
  const handleDownload = async () => {
    try {
      const response = await apiClient.get(
        `/notice/nfdown?ofile=${encodeURIComponent(notice.originalFilename)}&rfile=${notice.renameFilename}`,
        {
          responseType: 'blob', // 파일 데이터를 바이너리 형태로 받음
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', notice.originalFilename); // 다운로드될 파일 이름 지정
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      alert('파일을 다운로드할 수 없습니다.');
    }
  };

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>;
  }
  if (error) {
    return <div className={styles.container}>오류가 발생했습니다: {error.message}</div>;
  }
  if (!notice) {
    return <div className={styles.container}>게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{notice.title}</h2>
      <div className={styles.info}>
        <span>작성자 ID: {notice.userId}</span>
        <span>작성일: {new Date(notice.createdAt).toLocaleDateString()}</span>
      </div>
      <div className={styles.content}>{notice.contentBody}</div>

      {notice.originalFilename && (
        <div className={styles.attachments}>
          <strong>첨부파일</strong>
          <ul>
            <li>
              {/* 6. a 태그 대신 버튼을 사용하고, handleDownload 함수를 호출합니다. */}
              <button onClick={handleDownload} className={styles.attachmentLink}>
                {notice.originalFilename}
              </button>
            </li>
          </ul>
        </div>
      )}

      <div className={styles.buttonBar}>
        <button
          className={styles.listButton}
          onClick={() => {
            if (isAdminView && onBack) {
              onBack();
            } else if (location.pathname.includes('admin')) {
              navigate('/admin');
            } else {
              navigate('/notice');
            }
          }}
        >
          목록으로
        </button>
        {/* 7. 로그인한 사용자가 'admin'일 경우에만 수정/삭제 버튼을 보여줍니다. */}
        {isLoggedIn && role === 'admin' && (
          <>
            <button className={styles.editButton} onClick={() => navigate(`/notice/update/${contentId}`)}>
              수정
            </button>
            <button className={styles.deleteButton} onClick={handleDelete}>
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default NoticeDetail;
