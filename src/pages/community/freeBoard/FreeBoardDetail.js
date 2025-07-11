// src/pages/community/freeBoard/FreeBoardDetail.js

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../utils/axios';
import { AuthContext } from '../../../AuthProvider';
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
  const [post, setPost] = useState(null);
  const { secureApiRequest } = useContext(AuthContext);
  const { isLoggedIn, userNo } = useContext(AuthContext);

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiClient.get(`/board/detail/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error('상세글 조회 실패', err);
      }
    };

    fetchPost();
  }, []);

  if (!post) return <p>로딩 중...</p>;

  return (
    <div className={styles.container}>
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
                {' '}
                ✏ 수정
              </button>
              <button className={styles.DeleteBtn} onClick={handleDelete}>
                {' '}
                🗑 삭제
              </button>
            </div>
          )}
        </div>
        <div className={styles.meta}>
          <span>작성자ID: {post.userId}</span> |{' '}
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div className={styles.stats}>
          👁 {post.viewCount} ❤ {post.likeCount}
        </div>
      </div>

      {/* 본문 내용 */}
      <div className={styles.contentBox}>
        <p className={styles.content}>{post.contentBody}</p>
      </div>

      {/* 좋아요/북마크/공유 */}
      <div className={styles.actions}>
        <button>❤ 좋아요 {post.likeCount}</button>
        <button>🔖 북마크</button>
        <button className={styles.report}>🚩 신고하기</button>
      </div>

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
        <p>댓글 기능은 준비 중입니다.</p>
      </div>
    </div>
  );
}

export default FreeBoardDetail;
