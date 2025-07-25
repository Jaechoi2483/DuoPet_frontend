// src/components/common/FileUploader.js
import React, { useState, useRef } from 'react';
import styles from './FileUploader.module.css';

const FileUploader = ({ 
  onUploadComplete, 
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'], 
  maxSize = 5242880, // 5MB
  maxFiles = 5
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // 파일 선택 이벤트 핸들러
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndProcessFiles(selectedFiles);
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndProcessFiles(droppedFiles);
  };

  // 파일 유효성 검사 및 처리
  const validateAndProcessFiles = (selectedFiles) => {
    const currentFileCount = files.length;
    const newFileCount = selectedFiles.length;
    
    // 파일 개수 제한 검사
    if (currentFileCount + newFileCount > maxFiles) {
      setError(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
      return;
    }

    const validFiles = [];
    let errorMessage = null;

    selectedFiles.forEach(file => {
      // 파일 크기 검사
      if (file.size > maxSize) {
        errorMessage = `파일 크기는 ${(maxSize / 1024 / 1024).toFixed(1)}MB 이하여야 합니다.`;
        return;
      }

      // 파일 형식 검사
      if (!allowedTypes.includes(file.type)) {
        const allowedExtensions = allowedTypes.map(type => {
          const ext = type.split('/')[1];
          return ext === 'jpeg' ? 'jpg' : ext;
        }).join(', ');
        errorMessage = `지원되는 파일 형식: ${allowedExtensions}`;
        return;
      }

      validFiles.push(file);
    });

    if (errorMessage) {
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setError(null);
    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);
    
    // 즉시 부모 컴포넌트에 파일 전달
    onUploadComplete && onUploadComplete(newFiles);
    
    // 미리보기 생성
    generatePreviews(validFiles);
  };

  // 미리보기 생성 함수
  const generatePreviews = (newFiles) => {
    newFiles.forEach(file => {
      const previewId = Date.now() + Math.random().toString(36).substring(2, 9);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          setPreviews(prevPreviews => [
            ...prevPreviews,
            {
              id: previewId,
              file: file,
              url: e.target.result,
              type: 'image'
            }
          ]);
        };
        
        reader.readAsDataURL(file);
      } else {
        // 이미지가 아닌 파일은 파일 타입 표시
        setPreviews(prevPreviews => [
          ...prevPreviews,
          {
            id: previewId,
            file: file,
            url: null,
            type: file.type
          }
        ]);
      }
    });
  };

  // 파일 제거 함수
  const removeFile = (previewId) => {
    const previewToRemove = previews.find(preview => preview.id === previewId);
    if (!previewToRemove) return;

    // 미리보기에서 제거
    setPreviews(previews.filter(preview => preview.id !== previewId));
    
    // 파일 목록에서도 제거
    const newFiles = files.filter(file => file !== previewToRemove.file);
    setFiles(newFiles);
    
    // 부모 컴포넌트에 업데이트된 파일 목록 전달
    onUploadComplete && onUploadComplete(newFiles);
    
    // 에러 상태 초기화
    if (error && files.length === 1) {
      setError(null);
    }
  };


  return (
    <div className={styles.container}>
      {/* 파일 선택 영역 */}
      <div 
        className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.uploadIcon}>📁</div>
        <p className={styles.uploadText}>
          파일을 선택하거나 여기로 드래그하세요
        </p>
        <p className={styles.uploadSubtext}>
          최대 {maxFiles}개, {(maxSize / 1024 / 1024).toFixed(1)}MB 이하
        </p>
        <button 
          className={styles.selectButton}
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          파일 선택
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          style={{ display: 'none' }}
          accept={allowedTypes.join(',')}
        />
      </div>

      {/* 미리보기 영역 */}
      {previews.length > 0 && (
        <div className={styles.previewContainer}>
          <h4 className={styles.previewTitle}>선택된 파일 ({previews.length}개)</h4>
          <div className={styles.previewGrid}>
            {previews.map(preview => (
              <div key={preview.id} className={styles.previewItem}>
                {preview.type === 'image' ? (
                  <img 
                    src={preview.url} 
                    alt="Preview" 
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.fileIcon}>
                    {preview.type.includes('pdf') ? '📄' : '📎'}
                  </div>
                )}
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>
                    {preview.file.name}
                  </span>
                  <span className={styles.fileSize}>
                    {(preview.file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  className={styles.removeButton}
                  onClick={() => removeFile(preview.id)}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* 업로드 버튼 제거 - 파일 선택 시 자동으로 전달됨 */}

      {/* 메시지 표시 */}
      {successMessage && (
        <div className={styles.successMessage}>
          ✓ {successMessage}
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;