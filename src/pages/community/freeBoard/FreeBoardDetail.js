// src/pages/community/freeBoard/FreeBoardDetail.js

import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './FreeBoardDetail.module.css';

const postList = [
  // TOP 좋아요
  {
    id: '1',
    title: '우리 고양이가 너무 귀여워요',
    writer: '김지민',
    date: '2025.5.21',
    content: '우리 고양이가 창밖을 보면서 귀엽게 앉아있어요.',
    likes: 63,
    views: 150,
  },
  {
    id: '2',
    title: '강아지 산책 꿀팁',
    writer: '이슬기',
    date: '2025.5.20',
    content: '짧게 자주 산책하는 게 좋아요!',
    likes: 52,
    views: 142,
  },
  {
    id: '3',
    title: '냥이 화장실 훈련 성공기',
    writer: '한유진',
    date: '2025.5.19',
    content: '하루 2회 고정된 시간에 훈련했어요.',
    likes: 41,
    views: 110,
  },

  // TOP 조회수
  {
    id: '4',
    title: '반려동물 건강검진 주기?',
    writer: '홍길동',
    date: '2025.5.18',
    content: '보통 1년에 1회 이상은 필수입니다.',
    views: 189,
    likes: 30,
  },
  {
    id: '5',
    title: '강아지 예방접종 순서',
    writer: '이보람',
    date: '2025.5.17',
    content: '종합백신부터 시작하는 게 좋아요.',
    views: 171,
    likes: 25,
  },
  {
    id: '6',
    title: '우리집 냥이 관절 관리법',
    writer: '김지혜',
    date: '2025.5.16',
    content: '슬개골 탈구 주의해야 해요.',
    views: 158,
    likes: 18,
  },

  // 전체 게시글
  {
    id: '7',
    title: '우리 강아지 배변훈련 성공 스토리',
    writer: '홍길동',
    date: '2025.5.28',
    content: '처음엔 실패했지만 지금은 잘해요!',
    views: 189,
    likes: 32,
    comments: 7,
    comments: [
      {
        id: 1,
        writer: '수의사입니다',
        date: '2025.5.22',
        content:
          '일정한 시간과 장소에서 반복적으로 배변을 유도하는 것이 중요합니다. 실수했을 땐 혼내기보단 무시하고, 잘했을 땐 간식이나 칭찬으로 긍정 강화를 해주세요!',
        likes: 12,
      },
      {
        id: 2,
        writer: '강아지맘',
        date: '2025.5.22',
        content:
          '감사합니다! 말씀해주신 대로 실수할 땐 무시하고 잘할 때마다 간식을 줬더니 요즘엔 실수가 거의 없어요!',
        likes: 3,
      },
      {
        id: 3,
        writer: '댕댕이아빠',
        date: '2025.5.22',
        content: '우리 강아지도 비슷한 경험이 있었어요. 축하드립니다!! ',
        likes: 8,
      },
    ],
    tags: ['강아지', '배변훈련', '훈련팁'],
  },
  {
    id: '8',
    title: '고양이 츄르 종류 추천해주세요',
    writer: '이슬기',
    date: '2025.5.27',
    content: '참치맛이랑 닭가슴살맛 추천드려요!',
    views: 95,
    likes: 12,
    comments: 3,
  },
  {
    id: '9',
    title: '초보 집사들을 위한 준비물 리스트',
    writer: '김철수',
    date: '2025.5.25',
    content: '화장실, 사료, 캣타워는 필수입니다!',
    views: 210,
    likes: 41,
    comments: 10,
  },
];

// 관련 YouTube 더미 데이터
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
  const { id } = useParams();
  const post = postList.find(
    (item) => item.id === id || item.id === Number(id)
  );

  if (!post) {
    return <p>존재하지 않는 게시글입니다.</p>;
  }

  return (
    <div className={styles.container}>
      {/* 게시판 뱃지 + 태그 */}
      <div className={styles.tagHeader}>
        <span className={styles.badge}>자유게시판</span>
        <div className={styles.tagList}>
          {post.tags &&
            post.tags.map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                #{tag}
              </span>
            ))}
        </div>
      </div>

      {/* 제목 + 작성자 + 날짜 */}
      <div className={styles.titleWrapper}>
        <div ccalssName={styles.titleRow}>
          <h2 className={styles.title}>{post.title}</h2>
          <div className={styles.editArea}>
            <button>✏ 수정</button>
            <button>🗑 삭제</button>
          </div>
        </div>

        {/* 작성자 정보 */}
        <div className={styles.meta}>
          <span>{post.writer}</span> | <span>{post.date}</span>
        </div>
        <div className={styles.stats}>
          👁 {post.views} ❤ {post.likes} 💬 {post.comments?.length || 0}
        </div>
      </div>

      {/* 본문 내용 */}
      <div className={styles.contentBox}>
        <p className={styles.content}>{post.content}</p>
      </div>

      {/* 좋아요/북마크/공유 */}
      <div className={styles.actions}>
        <button>❤ 좋아요 {post.likes}</button>
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

      {/* 댓글 영역 */}
      <div className={styles.commentSection}>
        <h4>💬 댓글</h4>
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <strong>{comment.writer}</strong> <span>{comment.date}</span>
              </div>
              <div className={styles.commentContent}>{comment.content}</div>
              <div className={styles.commentMeta}>❤ {comment.likes}</div>
            </div>
          ))
        ) : (
          <p>댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default FreeBoardDetail;
