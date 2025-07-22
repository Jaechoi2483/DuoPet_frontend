// src/pages/login/FaceLoginPage.js

import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './signup/FaceRegisterPage.module.css';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider';

const FaceLoginPage = () => {
  const navigate = useNavigate();
  const { setLoggedIn, setUserid, setAccessToken, setRefreshToken, accessToken, refreshToken } =
    useContext(AuthContext);

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

  const handleFaceLogin = async () => {
    if (!capturedImage) return alert('사진을 먼저 찍어주세요.');

    const blob = await fetch(capturedImage).then((res) => res.blob());
    const file = new File([blob], 'face-login.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('image', file); // 로그인 API는 image 키 사용

    try {
      const res = await apiClient.post('/face-login/verify', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: refreshToken,
        },
      });
      const userId = res.data.verified_user;

      if (userId) {
        // ✅ 로그인 처리
        setUserid(userId);
        setLoggedIn(true);
        // setAccessToken(res.data.accessToken); // 토큰 받을 경우
        // setRefreshToken(res.data.refreshToken);

        alert(`${userId}님 로그인 성공!`);
        navigate('/');
      } else {
        alert('😢 얼굴 인식 실패: 일치하는 사용자를 찾지 못했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('인증 중 오류가 발생했습니다.');
    }
  };

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
            <button onClick={() => setCapturedImage(null)} className={styles.cancelButton}>
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
