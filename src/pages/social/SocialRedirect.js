// src/pages/social/SocialRedirect.js

import { useEffect, useContext, useRef } from 'react'; // useRef 추가
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';

function SocialRedirect() {
  const navigate = useNavigate();
  const { updateTokens } = useContext(AuthContext);
  const hasRun = useRef(false); // 실행 여부를 추적할 ref

  useEffect(() => {
    // 이미 실행되었다면 아무것도 하지 않음
    if (hasRun.current) {
      return;
    }
    hasRun.current = true; // 실행되었음을 표시

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const isNew = params.get('isNew');

    console.log('[디버그] accessToken:', accessToken);
    console.log('[디버그] refreshToken:', refreshToken);
    console.log('[디버그] isNew:', isNew);

    const loginFlow = async () => {
      if (accessToken) {
        await updateTokens(accessToken, refreshToken);
        if (isNew === 'true') {
          alert('소셜 로그인 최초 사용자입니다! 간편 회원가입 페이지로 이동합니다.');
          navigate('/social-signup');
        } else {
          alert('소셜 로그인 성공! 🎉');
          navigate('/');
        }
      }
    };

    loginFlow();
  }, []); // 의존성 배열은 비워둡니다.

  return null;
}

export default SocialRedirect;
