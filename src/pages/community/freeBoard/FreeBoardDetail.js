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
  { id: 'yt1', title: '강아지 배변 훈련, 이렇게 하면 성공합니다!', channel: '멍멍이 훈련소', views: '15,234회' },
  { id: 'yt2', title: '초보 보호자를 위한 배변 패드 사용법', channel: '반려견 TV', views: '8,567회' },
  { id: 'yt3', title: '수의사가 알려주는 배변 습관 훈련 팁', channel: '닥터펫', views: '12,890회' },
];

function FreeBoardDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { secureApiRequest, isLoggedIn, userNo } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportProps, setReportProps] = useState({ targetId: null, targetType: '' });

  const contentId = Number(id);

  const handleEdit = () => navigate(`/community/freeBoard/edit/${id}`);

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    try {
      const response = await secureApiRequest(`/board/free/${id}`, { method: 'DELETE' });
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
        withCredentials: true,
      });
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
      setBookmarked(res.data.bookmarked);
      setBookmarkCount((prev) => (res.data.bookmarked ? prev + 1 : prev - 1));
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

  const openReportModal = () => {
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능합니다.');
      return;
    }
    setReportProps({ targetId: contentId, targetType: 'content' });
    setIsReportOpen(true);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        await apiClient.get(`/board/view-count`, { params: { id } });
        const res = await apiClient.get(`/board/detail/${id}`);
        setPost(res.data);
        setLikeCount(res.data.likeCount);

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
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
  }, [id]);

  if (!post) return <p>로딩 중...</p>;

  return (
    <div className={styles.container}>
      {showToast && <div className={styles.toast}>{toastMessage}</div>}

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

      <div className={styles.contentBox}>
        <p className={styles.content}>{post.contentBody}</p>
      </div>

      <div className={styles.actions}>
        <button onClick={handleLike}>{liked ? '❤️ 좋아요 취소' : '🤍 좋아요'}</button>
        <button onClick={handleBookmark}>{bookmarked ? '🔖 북마크 해제' : '📌 북마크'}</button>
        <button onClick={openReportModal}>🚩 신고하기</button>
      </div>

      <FreeBoardReport
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={reportProps.targetId}
        targetType={reportProps.targetType}
      />

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

      <div className={styles.commentSection}>
        <CommentBox contentId={id} setReportProps={setReportProps} setIsReportOpen={setIsReportOpen} />
      </div>
    </div>
  );
}

export default FreeBoardDetail;
