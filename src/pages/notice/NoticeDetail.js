import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './NoticeDetail.module.css';

function NoticeDetail() {
  const { noticeId } = useParams();
  const navigate = useNavigate();

  // 실제 데이터는 API로 받아오게 할 예정. 지금은 더미 데이터.
  const notice = {
    title: '공지사항 제목 예시',
    author: '관리자',
    createdAt: '2024-06-01',
    content: '공지사항 본문 내용이 여기에 표시됩니다. 실제 데이터 연동 시 API에서 받아옵니다.',
    attachments: [
      {
        name: '첨부파일1.pdf',
        url: '/files/sample1.pdf'
      },
      {
        name: '이미지.png',
        url: '/files/sample2.png'
      }
    ]
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{notice.title}</h2>
      <div className={styles.info}>
        <span>작성자: {notice.author}</span>
        <span>작성일: {notice.createdAt}</span>
      </div>
      <div className={styles.content}>{notice.content}</div>

      {/* 첨부파일 표시 */}
      {notice.attachments && notice.attachments.length > 0 && (
        <div className={styles.attachments}>
          <strong>첨부파일</strong>
          <ul>
            {notice.attachments.map((file, idx) => (
              <li key={idx}>
                <a href={file.url} download target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.buttonBar}>
        <button className={styles.listButton} onClick={() => navigate(-1)}>
          목록으로
        </button>
      </div>
    </div>
  );
}

export default NoticeDetail; 