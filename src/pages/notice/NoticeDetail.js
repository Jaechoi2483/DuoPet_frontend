import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './NoticeDetail.module.css';
import apiClient from '../../utils/axios';

function NoticeDetail() {
  // eslint-disable-next-line no-unused-vars

  const { contentId } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null); // 게시물 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  useEffect(() => {
    // API를 호출하는 비동기 함수 선언
    const fetchNoticeDetail = async () => {
      try {
        setLoading(true); // 로딩 시작
        setError(null); // 이전 에러 초기화

        // GET /notice/{contentId} API 호출
        const response = await apiClient.get(`/notice/${contentId}`);

        // 성공적으로 데이터를 받아오면 notice state에 저장
        setNotice(response.data);
      } catch (err) {
        // 에러 발생 시 에러 state에 저장
        setError(err);
        console.error('공지사항 상세 정보를 불러오는 중 오류 발생:', err);
      } finally {
        // 로딩 종료 (성공/실패 여부와 관계없이)
        setLoading(false);
      }
    };

    fetchNoticeDetail(); // 함수 호출
  }, [contentId]);

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>;
  }
  if (error) {
    return (
      <div className={styles.container}>
        오류가 발생했습니다: {error.message}
      </div>
    );
  }
  if (!notice) {
    return <div className={styles.container}>게시물을 찾을 수 없습니다.</div>;
  }

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/notice/${contentId}`);
      alert('공지사항이 삭제되었습니다.');
      navigate('/notice');
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{notice.title}</h2>
      <div className={styles.info}>
        {/* 백엔드에서 받은 userId와 createdAt 사용 */}
        <span>작성자 ID: {notice.userId}</span>
        <span>작성일: {new Date(notice.createdAt).toLocaleDateString()}</span>
      </div>
      {/* 백엔드에서 받은 contentBody 사용 */}
      <div className={styles.content}>{notice.contentBody}</div>

      {/* 첨부파일 표시 (백엔드 originalFilename 필드 사용) */}
      {notice.originalFilename && (
        <div className={styles.attachments}>
          <strong>첨부파일</strong>
          <ul>
            <li>
              <a
                href={`${apiClient.defaults.baseURL}/notice/nfdown?ofile=${encodeURIComponent(notice.originalFilename)}&rfile=${notice.renameFilename}`}
                download={notice.originalFilename}
                className={styles.attachmentLink}
              >
                {notice.originalFilename}
              </a>
            </li>
          </ul>
        </div>
      )}

      <div className={styles.buttonBar}>
        <button className={styles.listButton} onClick={() => navigate(-1)}>
          목록으로
        </button>
        <button
          className={styles.editButton}
          onClick={() => navigate(`/notice/update/${contentId}`)}
        >
          수정
        </button>
        <button className={styles.deleteButton} onClick={handleDelete}>
          삭제
        </button>
      </div>
    </div>
  );
}

export default NoticeDetail;
