// components/community/comments/CommentBox.js

import React, { useEffect, useState, useContext } from 'react';
import apiClient from '../../../utils/axios';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import styles from './Comment.module.css';
import { AuthContext } from '../../../AuthProvider';

function CommentBox({ contentId, setReportProps, setIsReportOpen }) {
  const [comments, setComments] = useState([]);
  const [reload, setReload] = useState(false);
  const { isLoggedIn } = useContext(AuthContext); // 로그인 상태 가져오기

  // 맷글 목록 조회
  useEffect(() => {
    fetchComments();
  }, [contentId, reload]);

  // 서버로부터 댓글 목록 불러오기
  const fetchComments = async () => {
    try {
      const res = await apiClient.get(`/comments/view/${contentId}`);
      console.log('댓글 응답 데이터:', res.data);
      setComments(res.data);

      if (Array.isArray(res.data)) {
        setComments(res.data);
      } else if (Array.isArray(res.data.comments)) {
        setComments(res.data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('댓글 불러오기 실패', err);
    }
  };

  // 댓글 작성/삭제 후 목록 갱신
  const handleReload = () => setReload(!reload);

  return (
    <div className={styles.commentContainer}>
      <h3>댓글</h3>

      {/* 로그인한 경우에만 댓글 작성 폼 보이기 */}
      {isLoggedIn ? (
        <CommentForm contentId={contentId} onSuccess={handleReload} />
      ) : (
        <p className={styles.notice}>※ 댓글 작성을 하려면 로그인이 필요합니다.</p>
      )}

      <div className={styles.commentList}>
        {comments
          .filter((comment) => comment.parentCommentId === null)
          .map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              allComments={comments}
              onReload={handleReload}
              setReportProps={setReportProps}
              setIsReportOpen={setIsReportOpen}
            />
          ))}
      </div>
    </div>
  );
}

export default CommentBox;
