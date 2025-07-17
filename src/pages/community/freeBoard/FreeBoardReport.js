// src/pages/community/freeBoard/FreeBoardReport.js

import React, { useState } from 'react';
import apiClient from '../../../utils/axios';
import styles from './FreeBoardReport.module.css';

const FreeBoardReport = ({ postId, onClose }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const handleReport = async () => {
    if (!reason) {
      alert('신고 사유를 선택해주세요.');
      return;
    }

    try {
      const response = await apiClient.post('/api/report', {
        postId,
        reason,
        details,
      });
      alert('신고가 접수되었습니다.');
      onClose(); // 신고 후 모달 닫기
    } catch (error) {
      alert('신고 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>게시물 신고하기</h2>
        <p className={styles.desc}>신고 사유를 선택해주세요. 검토 후 조치를 취하겠습니다.</p>

        <div className={styles.selectGroup}>
          <label>신고 사유</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">-- 선택 --</option>
            <option value="spam">스팸/도배</option>
            <option value="inappropriate">부적절한 내용</option>
            <option value="wrongInfo">잘못된 정보</option>
            <option value="offensive">괴롭힘/욕설</option>
            <option value="copyright">저작권 침해</option>
            <option value="other">기타</option>
          </select>
        </div>

        <div className={styles.textAreaGroup}>
          <label>상세 설명 (선택사항)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="신고 사유에 대한 자세한 설명을 입력해주세요..."
          />
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button className={styles.submitBtn} onClick={handleReport}>
            신고하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeBoardReport;
