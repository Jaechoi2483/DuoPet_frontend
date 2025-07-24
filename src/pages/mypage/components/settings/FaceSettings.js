// src/pages/mypage/components/settings/FaceSettings.js

import React, { useRef, useState, useEffect, useContext } from 'react';
import styles from './FaceSettings.module.css';
import apiClient from '../../../../utils/axios';
import { AuthContext } from '../../../../AuthProvider';

const FaceSettings = ({ onBack }) => {
  const { userNo } = useContext(AuthContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  // 1. 등록된 얼굴 존재 여부 확인
  useEffect(() => {
    const fetchFaceStatus = async () => {
      try {
        const res = await apiClient.get('/users/check-face', {
          params: { userId: userNo },
        });
        if (res.data.faceRegistered) {
          setExistingImageUrl(`http://localhost:8080/mypage/face-images/${userNo}?_t=${Date.now()}`);
        } else {
          setExistingImageUrl(null);
        }
      } catch (err) {
        console.error('얼굴 등록 여부 확인 실패:', err);
      }
    };

    if (userNo) fetchFaceStatus();
  }, [userNo]);

  // 2. 카메라 시작
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      alert('카메라 접근 권한이 필요합니다.');
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => videoRef.current.play();
    }
  }, [isCameraActive, stream]);

  // 3. 캡처 처리
  const handleCapture = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 300, 225);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  // 4. 얼굴 등록
  const handleRegister = async () => {
    if (!capturedImage) return alert('사진을 먼저 찍어주세요.');

    const blob = await fetch(capturedImage).then((res) => res.blob());
    const file = new File([blob], 'face.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('userId', userNo);
    formData.append('faceImage', file);

    try {
      await apiClient.post('/users/face-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('얼굴 등록 완료!');
      setExistingImageUrl(`http://localhost:8080/mypage/face-images/${userNo}?_t=${Date.now()}`);
      setCapturedImage(null);
      setIsCameraActive(false);
    } catch (err) {
      console.error(err);
      alert('등록 실패: 서버 오류');
    }
  };

  // 5. 삭제 처리
  const handleDelete = async () => {
    try {
      await apiClient.delete('/mypage/face-delete', {
        params: { userId: userNo },
      });
      alert('얼굴 정보가 삭제되었습니다.');
      setCapturedImage(null);
      setExistingImageUrl(null);
      setIsCameraActive(false);
    } catch (err) {
      console.error(err);
      alert('삭제 실패: 서버 오류');
    }
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return (
    <div className={styles.faceSettingsContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ←
        </button>
        <h2 className={styles.title}>얼굴 등록/관리</h2>
      </div>

      <p className={styles.subtitle}>얼굴을 등록하거나 다시 촬영해 수정할 수 있어요.</p>

      <div className={styles.imagePreview}>
        {!isCameraActive && !capturedImage && existingImageUrl && (
          <img src={existingImageUrl} alt="등록된 얼굴" onError={() => setExistingImageUrl(null)} />
        )}

        {isCameraActive && !capturedImage && <video ref={videoRef} width="300" height="225" />}

        {capturedImage && <img src={capturedImage} alt="캡처된 얼굴" />}

        {!existingImageUrl && !capturedImage && !isCameraActive && (
          <div className={styles.placeholderBox}>
            <span className={styles.icon}>📷</span>
            <p>카메라를 켜고 얼굴을 등록하세요</p>
          </div>
        )}

        <canvas ref={canvasRef} width="300" height="225" style={{ display: 'none' }} />
      </div>

      <div className={styles.buttonGroup}>
        {!isCameraActive && (
          <button onClick={startCamera} className={styles.primaryButton}>
            📸 {existingImageUrl ? '다시 촬영' : '촬영 시작'}
          </button>
        )}

        {isCameraActive && !capturedImage && (
          <button onClick={handleCapture} className={styles.primaryButton}>
            📷 사진 찍기
          </button>
        )}

        {capturedImage && (
          <>
            <button onClick={handleRegister} className={styles.primaryButton}>
              등록 완료
            </button>
            <button
              onClick={() => {
                setCapturedImage(null);
                startCamera();
              }}
              className={styles.grayButton}
            >
              다시 찍기
            </button>
          </>
        )}

        {(existingImageUrl || capturedImage) && !isCameraActive && (
          <button onClick={handleDelete} className={styles.dangerButton}>
            ❌ 얼굴 삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default FaceSettings;
