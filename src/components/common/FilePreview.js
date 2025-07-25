import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios'; // 인증 포함된 axios 인스턴스
import styles from './FilePreview.module.css';

/**
 * 파일 미리보기 컴포넌트
 *
 * @param {string} fileUrl - 미리볼 파일 경로 또는 blob URL
 * @param {string} fileName - 표시할 파일명
 * @param {boolean} isLocal - blob URL 등 로컬에서 직접 보여줄 경우 true
 */
function FilePreview({ fileUrl, fileName, isLocal = false }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setObjectUrl(null);
    setError(null);

    const fetchFile = async () => {
      try {
        if (isLocal) {
          // blob URL 직접 사용
          setObjectUrl(fileUrl);
        } else {
          // 서버에서 blob으로 파일 받아오기
          const response = await apiClient.get(fileUrl, {
            responseType: 'blob',
          });
          const newObjectUrl = URL.createObjectURL(response.data);
          setObjectUrl(newObjectUrl);
        }
      } catch (err) {
        console.error('파일 로드 오류:', err);
        setError('파일을 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFile();

    return () => {
      if (!isLocal && objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileUrl, isLocal]);

  // 렌더링
  if (isLoading) return <div className={styles.loading}>파일 로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!objectUrl) return null;

  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  if (isImage) {
    return (
      <div className={styles.previewBox}>
        <img src={objectUrl} alt={fileName} className={styles.imagePreview} />
      </div>
    );
  }
  if (isPdf) {
    return (
      <div className={styles.previewBox}>
        <iframe src={objectUrl} title={fileName} className={styles.pdfPreview} />
      </div>
    );
  }
  return (
    <a href={objectUrl} download={fileName} className={styles.downloadButton}>
      다운로드
    </a>
  );
}

export default FilePreview;
