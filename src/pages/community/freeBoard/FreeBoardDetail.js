// src/pages/community/freeBoard/FreeBoardDetail.js

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../utils/axios';
import { AuthContext } from '../../../AuthProvider';
import FreeBoardReport from './FreeBoardReport';
import Modal from '../../../components/common/Modal';
import CommentBox from '../comment/CommentBox';
import styles from './FreeBoardDetail.module.css';

const dummyVideos = [
  {
    id: 'yt1',
    title: '강아지 배변 훈련, 이렇게 하면 성공합니다!',
    channel: '멍멍이 훈련소',
    views: '15,234회',
  },
  {
    id: 'yt2',
    title: '초보 보호자를 위한 배변 패드 사용법',
    channel: '반려견 TV',
    views: '8,567회',
  },
  {
    id: 'yt3',
    title: '수의사가 알려주는 배변 습관 훈련 팁',
    channel: '닥터펫',
    views: '12,890회',
  },
];

function FreeBoardDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { secureApiRequest } = useContext(AuthContext);
  const { isLoggedIn, userNo } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/community/freeBoard/edit/${id}`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('정말로 이 게시글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const response = await secureApiRequest(`/board/free/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 200) {
        alert('게시글이 삭제되었습니다.');
        navigate('/community/freeBoard');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 요청 실패', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLike = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // 로그인 안 했을 경우 메시지 출력
    if (!accessToken || !refreshToken) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    try {
      const res = await apiClient.post(`/board/like/${id}`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
        },
        withCredentials: true, // CORS 쿠키 인증 허용
      });

      console.log('accessToken:', accessToken);
      console.log('refreshToken:', refreshToken);
      console.log('서버 응답 데이터:', res.data);

      setLiked(res.data.liked);
      setLikeCount((prev) => (res.data.liked ? prev + 1 : prev - 1));
      triggerToast(res.data.liked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.');
    } catch (err) {
      console.error('좋아요 실패', err);
    }
  };

  const handleBookmark = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    try {
      const res = await apiClient.post(`/board/bookmark/${id}`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
        },
        withCredentials: true,
      });

      console.log('서버 응답 데이터:', res.data);

      setBookmarked(res.data.bookmarked); // 북마크 상태 업데이트
      setBookmarkCount((prev) => (res.data.bookmarked ? prev + 1 : prev - 1)); // 북마크 카운트 업데이트
      triggerToast(res.data.bookmarked ? '북마크가 등록되었습니다.' : '북마크가 해제되었습니다.');
    } catch (err) {
      console.error('북마크 실패', err);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 신고 폼 관련 상태
  const handleOpenReport = () => setIsReportOpen(true);
  const handleCloseReport = () => setIsReportOpen(false);

  // 조회수 증가 & 좋아요 수 증가
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // 조회수 증가 요청 (비회원도 접근 가능)
        await apiClient.get(`/board/view-count`, { params: { id } });

        // 게시글 상세 정보 가져오기
        const res = await apiClient.get(`/board/detail/${id}`);
        setPost(res.data);
        setLikeCount(res.data.likeCount);

        // accessToken, refreshToken 정의 추가
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // 좋아요 상태 확인 API 호출
        const likeRes = await apiClient.get(`/like/${id}/status`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            RefreshToken: `Bearer ${refreshToken}`,
          },
        });
        setLiked(likeRes.data.liked);
      } catch (err) {
        console.error('상세글 조회 실패', err);
      }
    };

    fetchPost();
  }, [id]); // id 변경 시 재실행

  if (!post) return <p>로딩 중...</p>;

  return (
    <div className={styles.container}>
      {/* 토스트 메시지 출력 */}
      {showToast && <div className={styles.toast}>{toastMessage}</div>}

      {/* 게시판 뱃지 + 태그 */}
      <div className={styles.tagHeader}>
        <span className={styles.badge}>자유게시판</span>
        <div className={styles.tagList}>
          {post.tags &&
            post.tags.split(',').map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                #{tag.trim()}
              </span>
            ))}
        </div>
      </div>

      {/* 제목 + 작성자 + 날짜 */}
      <div className={styles.titleWrapper}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{post.title}</h2>
          {isLoggedIn && post.userId === userNo && (
            <div className={styles.editArea}>
              <button className={styles.editBtn} onClick={handleEdit}>
                ✏ 수정
              </button>
              <button className={styles.DeleteBtn} onClick={handleDelete}>
                🗑 삭제
              </button>
            </div>
          )}
        </div>
        <div className={styles.meta}>
          <span>작성자ID: {post.userId}</span> | <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div className={styles.stats}>
          👁 {post.viewCount} ❤ {likeCount}
        </div>
      </div>

      {/* 본문 내용 */}
      <div className={styles.contentBox}>
        <p className={styles.content}>{post.contentBody}</p>
      </div>

      {/* 좋아요/북마크/신고하기 */}
      <div className={styles.actions}>
        <button onClick={handleLike}>{liked ? '❤️ 좋아요 취소' : '🤍 좋아요'}</button>
        <button onClick={handleBookmark}>{bookmarked ? '🔖 북마크 해제' : '📌 북마크'}</button>
        <button onClick={handleOpenReport}>🚩 신고하기</button>
      </div>

      {/* 공통 모달로 신고 UI 렌더링 */}
      <Modal isOpen={isReportOpen} onClose={handleCloseReport}>
        <FreeBoardReport postId={id} onClose={handleCloseReport} />
      </Modal>

      {/* 관련 YouTube 영상 */}
      <div className={styles.youtubeSection}>
        <h3>📺 관련 YouTube 영상</h3>
        <div className={styles.videoList}>
          {dummyVideos.map((video) => (
            <div key={video.id} className={styles.videoCard}>
              <div className={styles.videoThumbnail}>🎬 썸네일</div>
              <p className={styles.videoTitle}>{video.title}</p>
              <p className={styles.videoMeta}>
                {video.channel} · 조회수 {video.views}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 영역은 아직 미연동 상태 */}
      <div className={styles.commentSection}>
        <h4>💬 댓글</h4>
        <CommentBox contentId={id} />
      </div>
    </div>
  );
}

export default FreeBoardDetail;
