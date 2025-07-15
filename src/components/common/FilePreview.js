// src/components/common/FilePreview.js

import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios'; // 인증 헤더가 포함된 axios 인스턴스
import styles from './FilePreview.module.css';

function FilePreview({ fileUrl, fileName }) {
  // ✨ 수정: 임시 URL, 로딩, 에러 상태를 관리할 state 추가
  const [objectUrl, setObjectUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fileUrl이 없으면 아무 작업도 하지 않음
    if (!fileUrl) {
      setIsLoading(false);
      return;
    }

    // 새로운 fileUrl을 위해 상태 초기화
    setIsLoading(true);
    setObjectUrl(null);
    setError(null);

    // 비동기 함수로 파일 데이터를 가져옴
    const fetchFile = async () => {
      try {
        // 1. apiClient를 사용해 인증된 요청으로 파일을 'blob' 형태로 가져옵니다.
        const response = await apiClient.get(fileUrl, {
          responseType: 'blob',
        });
        // 2. 받은 파일 데이터를 가리키는 임시 URL을 생성합니다.
        const newObjectUrl = URL.createObjectURL(response.data);
        setObjectUrl(newObjectUrl);
      } catch (err) {
        console.error('파일 로드 오류:', err);
        setError('파일을 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFile();

    // ✨ 중요: 컴포넌트가 사라질 때 생성된 임시 URL을 메모리에서 해제하여 누수를 방지합니다.
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileUrl]); // fileUrl이 변경될 때마다 이 로직을 다시 실행합니다.

  // --- 아래는 렌더링 로직 ---

  if (isLoading) {
    return <div className={styles.loading}>파일 로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // objectUrl이 없으면 아무것도 표시하지 않음
  if (!objectUrl) return null;

  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  // ✨ 수정: src와 href에 fileUrl 대신 생성된 임시 URL(objectUrl)을 사용합니다.
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
    // ✨ 수정: 다운로드 링크에도 objectUrl을 사용하고, 'download' 속성으로 원본 파일명을 지정합니다.
    <a href={objectUrl} download={fileName} className={styles.downloadButton}>
      다운로드
    </a>
  );
}

export default FilePreview;
