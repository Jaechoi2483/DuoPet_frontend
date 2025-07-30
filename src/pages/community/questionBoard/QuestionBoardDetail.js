// src/pages/community/question/questionBoardDetail.js

import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../utils/axios';
import { AuthContext } from '../../../AuthProvider';
import BoardReport from '../report/BoardReport';
import Modal from '../../../components/common/Modal';
import CommentBox from '../comment/CommentBox';
import styles from './QuestionBoardDetail.module.css';

// 게시글 상세 보기 페이지 (질문 게시판)
function QuestionBoardDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { secureApiRequest, isLoggedIn, userNo } = useContext(AuthContext);
  const contentId = Number(id);

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportProps, setReportProps] = useState({ targetId: null, targetType: '' });
  const [videos, setVideos] = useState([]);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const BACKEND_URL = 'http://localhost:8080';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '날짜 없음' : date.toLocaleDateString();
  };

  const handleEdit = () => navigate(`/community/questionBoard/edit/${id}`);
  const handleBackToList = () => navigate('/community/questionBoard');

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    try {
      const response = await secureApiRequest(`/board/question/${id}`, { method: 'DELETE' });
      if (response.status === 200) {
        alert('게시글이 삭제되었습니다.');
        navigate('/community/questionBoard');
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

    const validAccessToken = accessToken && accessToken !== 'null' ? accessToken : null;
    const validRefreshToken = refreshToken && refreshToken !== 'null' ? refreshToken : null;

    if (!validAccessToken) {
      alert('로그인 후 이용 가능합니다.');
      return;
    }

    try {
      const res = await apiClient.post(`/board/question/like/${id}`, null, {
        headers: {
          Authorization: `Bearer ${validAccessToken}`,
          RefreshToken: `Bearer ${validRefreshToken}`,
        },
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
      const res = await apiClient.post(`/board/question/bookmark/${id}`, null, {
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
        // 1. 조회수 증가 요청
        await apiClient.get(`/board/view-count`, { params: { id } });

        // 2. 게시글 상세 정보 가져오기
        const res = await apiClient.get(`/board/question/detail/${id}`);
        setPost(res.data);
        setLikeCount(res.data.likeCount);

        // 3. 로컬스토리지에서 토큰 불러오기
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        const validAccessToken = accessToken && accessToken !== 'null' ? accessToken : null;
        const validRefreshToken = refreshToken && refreshToken !== 'null' ? refreshToken : null;

        // 4. 로그인 상태일 때만 좋아요/북마크 상태 확인
        if (validAccessToken && validRefreshToken) {
          try {
            const likeRes = await apiClient.get(`/board/question/like/${id}/status`, {
              headers: {
                Authorization: `Bearer ${validAccessToken}`,
                RefreshToken: `Bearer ${validRefreshToken}`,
              },
            });
            console.log('✅ 좋아요 상태 응답:', likeRes.data);
            setLiked(likeRes.data.liked);
          } catch (err) {
            console.error('좋아요 상태 확인 실패:', err);
            setLiked(false);
          }

          try {
            const bookmarkRes = await apiClient.get(`/board/question/bookmark/${id}/status`, {
              headers: {
                Authorization: `Bearer ${validAccessToken}`,
                RefreshToken: `Bearer ${validRefreshToken}`,
              },
            });
            console.log('✅ 북마크 상태 응답:', bookmarkRes.data);
            setBookmarked(bookmarkRes.data.bookmarked);
          } catch (err) {
            console.error('북마크 상태 확인 실패:', err);
            setBookmarked(false);
          }
        } else {
          // 5. 비로그인 상태일 경우 초기값 설정
          setLiked(false);
          setBookmarked(false);
        }
      } catch (err) {
        console.error('❌ 상세글 조회 실패', err);
      }
    };

    fetchPost();
  }, [id]);

  const hasFetchedVideo = useRef(false);

  useEffect(() => {
    if (!post || !post.tags) return;
    if (hasFetchedVideo.current) return;

    hasFetchedVideo.current = true;

    const fetchRecommendedVideos = async () => {
      try {
        setIsVideoLoading(true);

        const res = await apiClient.post('http://localhost:8000/api/v1/video-recommend/recommend', {
          contentId: post.contentId,
          maxResults: 3,
        });

        console.log('AI 응답:', res.data.data);

        setVideos(res.data.data.videos);
      } catch (error) {
        console.error('영상 추천 실패:', error);
      } finally {
        setIsVideoLoading(false);
      }
    };

    fetchRecommendedVideos();
  }, [post]);

  if (!post) return <p>로딩 중...</p>;

  return (
    <div className={styles.container}>
      {showToast && <div className={styles.toast}>{toastMessage}</div>}

      <div className={styles.backBtnWrapper}>
        <button className={styles.historyBackBtn} onClick={() => window.history.back()}>
          뒤로가기
        </button>

        <button className={styles.listBtn} onClick={() => navigate('/community/questionBoard')}>
          목록으로
        </button>
      </div>

      <div className={styles.tagHeader}>
        <span className={styles.badge}>질문게시판</span>
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
                ✏️ 수정
              </button>
              <button className={styles.deleteBtn} onClick={handleDelete}>
                🗑 삭제
              </button>
            </div>
          )}
        </div>
        <div className={styles.meta}>
          <span>작성자: {post?.nickname ?? '작성자 없음'}</span> | <span>{formatDate(post?.createdAt)}</span>
        </div>
        <div className={styles.stats}>
          👁 {post.viewCount} ❤ {likeCount}
        </div>
      </div>

      <div className={styles.contentBox}>
        <p className={styles.content}>{post.contentBody}</p>
      </div>

      {post.imageUrl && (
        <div className={styles.imageWrapper}>
          <img src={`${BACKEND_URL}${post.imageUrl}`} alt="첨부 이미지" className={styles.attachedImage} />
        </div>
      )}

      <div className={styles.actions}>
        <button onClick={handleLike}>{liked ? '❤️ 좋아요 취소' : '🤍 좋아요'}</button>
        <button onClick={handleBookmark}>{bookmarked ? '🔖 북마크 해제' : '📌 북마크'}</button>
        <button onClick={openReportModal}>🚩 신고하기</button>
      </div>

      <BoardReport
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={reportProps.targetId}
        targetType={reportProps.targetType}
      />

      <div className={styles.youtubeSection}>
        <h3>📺 관련 YouTube 영상</h3>

        {isVideoLoading ? (
          <>
            <div className={styles.localLoadingBarWrapper}>
              <div className={styles.localLoadingBar}></div>
            </div>
            <p className={styles.loadingText}>🔄 추천 영상을 불러오는 중입니다...</p>
          </>
        ) : videos.length > 0 ? (
          <div className={styles.videoList}>
            {videos.map((video) => (
              <a
                key={video.video_id}
                href={`https://www.youtube.com/watch?v=${video.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoCard}
              >
                <div className={styles.videoThumbnail}>
                  <img src={video.thumbnail_url} alt={video.title} />
                </div>
                <p className={styles.videoTitle}>{video.title}</p>
                <p className={styles.videoMeta}>
                  {video.channel_name} · 조회수 {video.view_count}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p>😥 관련 추천 영상을 찾을 수 없습니다.</p>
        )}
      </div>

      <div className={styles.commentSection}>
        <CommentBox contentId={id} setReportProps={setReportProps} setIsReportOpen={setIsReportOpen} />
      </div>
    </div>
  );
}

export default QuestionBoardDetail;
