// src/pages/login/FaceLoginPage.js

import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './signup/FaceRegisterPage.module.css';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider';

const FaceLoginPage = () => {
  const navigate = useNavigate();
  const { setAuthInfo, updateTokens } = useContext(AuthContext);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // 카메라 시작
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        alert('카메라 접근이 차단되었습니다. 브라우저 주소창 왼쪽 아이콘을 눌러 허용해주세요.');
      } else if (err.name === 'AbortError') {
        alert('카메라 시작이 중단되었습니다. 다른 앱에서 사용 중인지 확인해주세요.');
      } else {
        alert('카메라 권한이 필요합니다.');
      }
      console.error('Camera error:', err);
    }
  };

  // 스트림 연결
  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => videoRef.current.play();
    }
  }, [isCameraActive, stream]);

  // 캡처
  const handleCapture = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 300, 225);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  // 얼굴 로그인
  const handleFaceLogin = async () => {
    if (!capturedImage) return alert('사진을 먼저 찍어주세요.');

    const blob = await fetch(capturedImage).then((res) => res.blob());
    const file = new File([blob], 'face-login.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post('http://localhost:8000/api/v1/face-login/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { verified, user_id } = res.data;
      console.log('[FaceLogin] 응답:', res.data);

      if (verified === true && user_id) {
        // 백엔드에서 토큰 받아오기
        const loginRes = await apiClient.post('/face-login/success', { userId: user_id });
        const { accessToken, refreshToken } = loginRes.data;

        // AuthContext 내 함수로 토큰 저장 + 사용자 정보 설정
        updateTokens(accessToken, refreshToken);

        alert('얼굴 로그인 성공!');
        navigate('/');
      } else {
        alert(`${res.data.error || '일치하는 사용자를 찾지 못했습니다.'}`);
      }
    } catch (err) {
      console.error('[FaceLogin] 에러 응답:', err?.response?.data || err.message);
      alert('인증 중 오류가 발생했습니다.');
    }
  };

  // 카메라 종료 (unmount 시)
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>📸 얼굴 인식 로그인</h2>
      <p className={styles.subtitle}>정면 얼굴을 촬영하여 로그인합니다.</p>

      <div className={styles.imagePreview}>
        {!isCameraActive && !capturedImage && (
          <div className={styles.placeholderBox}>
            <span className={styles.icon}>📷</span>
            <p>카메라를 켜주세요</p>
            <button onClick={startCamera} className={styles.nextButton}>
              📷 촬영 시작
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
            📸 사진 찍기
          </button>
        )}

        {capturedImage && (
          <>
            <button onClick={handleFaceLogin} className={styles.submitButton}>
              로그인 시도
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
          이전으로
        </button>
      </div>
    </div>
  );
};

export default FaceLoginPage;
