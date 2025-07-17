// src/pages/social/SocialRedirect.js

import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';

function SocialRedirect() {
  const navigate = useNavigate();
  const { updateTokens } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const isNew = params.get('isNew'); // 추가: 최초 사용자 여부 확인

    if (accessToken) {
      updateTokens(accessToken, refreshToken);

      if (isNew === 'true') {
        alert('소셜 로그인 최초 사용자입니다! 간편 회원가입 페이지로 이동합니다.');
        navigate('/social-signup');
      } else {
        alert('소셜 로그인 성공! 🎉');
        navigate('/');
      }
    } else {
      alert('소셜 로그인 실패 😥 다시 시도해주세요.');
      navigate('/login');
    }
  }, []);

  return null;
}

export default SocialRedirect;
