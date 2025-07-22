// src/pages/signup/FaceRegisterPage.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './FaceRegisterPage.module.css';
import apiClient from '../../../utils/axios';

const FaceRegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      alert('카메라 권한이 필요합니다.');
      console.error('Camera error:', err);
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();
    }
  }, [isCameraActive, stream]);

  const handleCapture = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 300, 225);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  const handleRegister = async () => {
    if (!capturedImage) return alert('사진을 먼저 찍어주세요.');

    const blob = await fetch(capturedImage).then((res) => res.blob());
    const file = new File([blob], 'face.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('faceImage', file);

    try {
      await apiClient.post('/users/face-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('얼굴 이미지 등록 완료!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('등록 실패: 서버 오류');
    }
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>얼굴 인식 등록</h2>
      <p className={styles.subtitle}>정면 얼굴을 찍어 등록해 주세요. 안전한 얼굴 로그인에 사용됩니다.</p>

      <div className={styles.imagePreview}>
        {!isCameraActive && !capturedImage && (
          <div className={styles.placeholderBox}>
            <span className={styles.icon}>📷</span>
            <p>얼굴 인식을 위해 카메라를 켜주세요</p>
            <button onClick={startCamera} className={styles.nextButton}>
              📸 촬영 시작
            </button>
          </div>
        )}

        {isCameraActive && !capturedImage && <video ref={videoRef} width="300" height="225" />}

        {capturedImage && <img src={capturedImage} alt="캡처된 얼굴" />}

        <canvas ref={canvasRef} width="300" height="225" style={{ display: 'none' }} />
      </div>

      <div className={styles.buttonGroup}>
        {isCameraActive && !capturedImage && (
          <button onClick={handleCapture} className={styles.nextButton}>
            📷 사진 찍기
          </button>
        )}

        {capturedImage && (
          <>
            <button onClick={handleRegister} className={styles.submitButton}>
              등록 완료
            </button>
            <button
              onClick={() => {
                setCapturedImage(null);
                startCamera();
              }}
              className={styles.cancelButton}
            >
              다시 찍기
            </button>
          </>
        )}

        <button onClick={() => navigate('/login')} className={styles.skipButton}>
          나중에 등록하기
        </button>
      </div>
    </div>
  );
};

export default FaceRegisterPage;
