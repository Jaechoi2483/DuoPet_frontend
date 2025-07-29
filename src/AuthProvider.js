// src/AuthProvider.js
// 전역 상태 관리자 : 로그인 여부 상태, accessToken 과 refreshToken 상태 관리가 목적임
// 비동기 요청시 토큰 상태 확인 작업도 전역으로 관리할 것임
// 1. 로그인 상태 관리 : accessToken, refreshToken 으로 로그인 상태 설정
// 2. 토큰 저장 및 파싱 : JWT 에서 사용자 정보(role, username 등) 파싱
// 3. 토큰 자동 재발급 : accessToken or refreshToken 만료시 재발급 처리 => refreshToken 만료시 로그인연장 여부 확인
// 4. 로그아웃 및 리다이렉션 : 토큰 만료시 로그아웃 처리
// 5. 안전한 서버측 api 요청 : 비동기 요청시 인증 토큰 포함해서 요청 수행 처리

import { createContext, useState, useEffect } from 'react';
import apiClient from './utils/axios';
// 💡 1. 필요한 서비스와 컴포넌트를 import 합니다. (경로는 실제 위치에 맞게 수정해주세요)
import websocketService from './services/websocketService';
import NotificationToast from './components/consultation/NotificationToast';

// 전역(global) 사용을 위해 함수 밖에서 선언함
// Context 생성 : 외부 컴포넌트가 import 해서 사용할 수 있도록 export 지정함
export const AuthContext = createContext();

// accessToken 을 전달받아서, 사용자 정보 추출을 위한 파싱 작업
// 필요한 이유 : JWT 는 base64Url 로 인코딩해서 클라이언트로 전송하였음
// 클라이언트는 받아서 replace 를 통해 base64 로 변환 후 디코딩 처리 필요함
// JWT 에서 Payload(두번째, . 구분자 사이의 값)를 파싱하여 사용자 정보 추출하는 함수 작성함
const parseAccessToken = (token) => {
  if (!token) return null;
  try {
    // 전달받은 토큰에서 payload 부분 추출함
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        // 빽틱 (`) 사용할 것
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    console.log('토큰 파싱 결과:', parsed); // 디버깅 로그 추가
    console.log('nickname 값:', parsed.nickname); // nickname 값 확인
    return parsed; // 페이로드 문자열을 json 객체로 파싱해서 리턴함
  } catch (error) {
    console.error('AccessToken 파싱 오류 : ', error);
    return null;
  }
};

// Context Provider 컴포넌트 : export function AuthProvider() {} 과 같음
// function AuthProvider() {}  export default 함수명;  과 같음
export const AuthProvider = ({ children }) => {
  // 매개변수 children : 전역 상태 관리자를 이용하는 하위 컴포넌트 (페이지)를 말함

  // 다른 컴포넌트에서 로그인 확인과 사용자 정보 이용을 위해 준비함
  const [authInfo, setAuthInfo] = useState({
    isLoggedIn: false,
    role: '',
    username: '',
    userid: '',
  });

  // 브라우저에 이 컴포넌트가 랜더링될 때 (로드되어서 출력) 작동되는 훅임
  // window.onload = function(){ 페이지 출력될 때 자동 실행하는 코드 구문};  과 같은 기능을 수행하는 훅임
  // 처리 기능 : 마운트시 토큰 검사
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 💡 2. 새로운 상담 요청 알림을 관리할 상태를 추가합니다.
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // 페이지 로드 시 인증 상태를 확인하는 로직
    const checkAuthStatus = () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('AuthProvider 마운트: 토큰 확인 중...');

        if (accessToken && refreshToken) {
          console.log('토큰 발견, 파싱 시작');
          const parsedToken = parseAccessToken(accessToken);

          if (parsedToken) {
            const now = Date.now();
            const exp = parsedToken.exp * 1000;

            if (now > exp) {
              console.warn('accessToken 만료됨! 로그인 상태로 만들지 않음');
              setAuthInfo({ isLoggedIn: false, role: '', username: '', userid: '' });
              localStorage.clear(); // 만료된 토큰 제거
              return;
            }

            console.log('파싱된 토큰 정보:', parsedToken);
            // localStorage에 필요한 정보 저장 (WebSocket 연결 등을 위해)
            localStorage.setItem('userRole', parsedToken.role);
            localStorage.setItem('userId', parsedToken.sub);
            localStorage.setItem('userNo', parsedToken.userNo);

            // 토큰이 유효하면 로그인 상태로 설정
            const authData = {
              isLoggedIn: true,
              role: parsedToken.role,
              username: parsedToken.nickname,
              userid: parsedToken.sub,
              userNo: parsedToken.userNo,
            };
            console.log('설정할 인증 정보:', authData);
            setAuthInfo(authData);
          } else {
            // 토큰 파싱 실패 시, 로그아웃 상태로 확정
            setAuthInfo({ isLoggedIn: false, role: '', username: '', userid: '' });
            localStorage.clear();
          }
        } else {
          // ✨ 토큰이 없는 경우에도 명시적으로 로그아웃 상태임을 확정해줍니다.
          setAuthInfo({ isLoggedIn: false, role: '', username: '', userid: '' });
        }
      } catch (error) {
        console.error('인증 상태 확인 중 오류 발생', error);
        setAuthInfo({ isLoggedIn: false, role: '', username: '', userid: '' });
      } finally {
        // ✨ [수정 #3] 모든 확인 절차가 끝나면, 로딩 상태를 false로 변경하여
        // 자식 컴포넌트들에게 "이제 확인 끝났으니 동작해도 좋다"는 신호를 보냅니다.
        console.log('AuthProvider: 인증 상태 확인 완료.');
        setIsAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, []); //useEffect

  // 💡 3. WebSocket 연결은 App.js에서 관리하므로 여기서는 제거
  // AuthProvider에서는 인증 관련 기능만 담당

  // 💡 4. 알림 팝업을 닫는 함수를 만듭니다.
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // 로그아웃 함수
  const logoutAndRedirect = async () => {
    if (!authInfo.isLoggedIn) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    try {
      await apiClient.post(
        '/logout',
        {}, // POST지만 body는 없음
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('서버에 로그아웃 요청 성공');
    } catch (error) {
      console.error('서버 로그아웃 요청 실패:', error.response?.data);
    }

    // 로그아웃 후에도 최근 로그인 provider는 유지
    const lastLoginProvider = localStorage.getItem('lastLoginProvider');

    // 토큰 및 기타 민감 정보만 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('loginId');
    localStorage.removeItem('rememberId');
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userNo');

    // 클라이언트 토큰 삭제
    //localStorage.clear();

    // 최근 로그인 provider는 복원
    if (lastLoginProvider) {
      localStorage.setItem('lastLoginProvider', lastLoginProvider);
    }
    setAuthInfo({ isLoggedIn: false, role: '', username: '', userid: '' });
    window.location.href = '/';
  }; // logoutAndRedirect

  // 로그인 성공시 공통 토큰 저장 처리 및 상태 업데이트 함수
  const updateTokens = (accessToken, refreshToken) => {
    setIsAuthLoading(true); // 로딩 시작
    try {
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        const parsedToken = parseAccessToken(accessToken);
        console.log('AuthProvider updateTokens : ', parsedToken);

        if (parsedToken) {
          // localStorage에 필요한 정보 저장 (WebSocket 연결 등을 위해)
          localStorage.setItem('userRole', parsedToken.role);
          localStorage.setItem('userId', parsedToken.sub);
          localStorage.setItem('userNo', parsedToken.userNo);

          setAuthInfo({
            isLoggedIn: true,
            role: parsedToken.role,
            username: parsedToken.nickname,
            userid: parsedToken.sub,
            userNo: parsedToken.userNo,
          });
        } else {
          // 파싱 실패시 로그아웃 처리
          localStorage.clear();
          setAuthInfo({ isLoggedIn: false, role: '', username: '', userid: '' });
        }
      }

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      console.error('토큰 업데이트 중 오류 발생:', error);
      localStorage.clear();
      setAuthInfo({ isLoggedIn: false, role: '', username: '', userid: '' });
    } finally {
      setIsAuthLoading(false); // 로딩 완료
    }
  }; // updateTokens

  // 공통으로 사용할 서버측 API 요청 처리용 함수 (로그인 상태에서 요청하는 서비스들)
  // 요청 전에 토큰 만료 확인, accessToken 만료시 refreshToken 으로 토큰 재발급 요청
  // refreshToken 만료시에는 로그인 연장 여부 확인하고, refreshToken 재발급 요청
  // 두 개의 토큰이 정상일 때 API 요청 처리에 대한 기능 구현
  const secureApiRequest = async (url, options = {}, retry = true) => {
    console.log('AuthProvider.secureApiRequest 실행!!!!');

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      throw new Error('AccessToken 또는 RefreshToken 이 없습니다.');
    }

    try {
      const method = options.method || 'GET';
      const data = options.body || null;

      //formData 인지 확인함
      const isFormData = data instanceof FormData;
      console.log('FormData 인가 : ', isFormData);

      //전달온 data 정보 확인
      if (isFormData) {
        for (let pair of data.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      // 서버측으로 서비스 요청 보내고 결과 받기
      const response = await apiClient({
        url,
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`, //빽틱 사용할 것
          RefreshToken: `Bearer ${refreshToken}`, //빽틱 사용할 것
          ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }),
        },
        data,
      });

      return response; // 요청 성공시 리턴함
    } catch (error) {
      console.error('API 요청 실패 - 상태 코드 : ', error.response?.status);
      console.error('API 응답 해더 : ', error.response?.headers);
      console.error('API 응답 데이터 : ', error.response?.data);

      const tokenExpiredHeader = error.response?.headers['token-expired'];

      if (error.response?.status === 401 && retry) {
        // ststus.code : 401 (UnAuthrized 임)
        // RefreshToken 만료시 로그인 연장 여부 확인
        if (tokenExpiredHeader === 'RefreshToken') {
          const confirmExtend = window.confirm('로그인 세션이 만료되었습니다. 로그인 연장하시겠습니까?');
          if (confirmExtend) {
            console.log('로그인 연장 동의 누름...');
            try {
              // RefreshToken 재발급 요청함수 실행
              await handleReissueTokens(true);
              // RefreshToken 재발급되면, 서버측 API 다시 요청함
              return secureApiRequest(url, options, false); // 재시도 요청함
            } catch (refreshError) {
              console.error('로그인 연장 실패 : ', refreshError.response?.data);
              alert('로그아웃 되었습니다. 다시 로그인하세요.');
              logoutAndRedirect();
            }
          } else {
            // 로그인 연장을 선택하지 않았다면...
            alert('로그인이 연장되지 않았습니다. 다시 로그인하세요.');
            logoutAndRedirect();
          }
        } // 리프레시토큰 만료되었을 때

        // AccessToken 만료시 RefreshToken 으로 AccessToken 재발급
        if (tokenExpiredHeader === 'AccessToken') {
          console.warn('AccessToken 만료, RefreshToken 으로 재발급 시도중....');
          try {
            await handleReissueTokens();
            return secureApiRequest(url, options, false); // API 재호출 시도
          } catch (accessError) {
            console.error('AccessToken 재발급 실패...', accessError.response?.data);
            logoutAndRedirect();
          }
        }
      }

      throw error; // 다른 에러 처리
    }
  }; //  secureApiRequest

  // AccessToken or RefreshToken 재발급 처리 함수 ===========================
  const handleReissueTokens = async (extendLogin = false) => {
    let accessToken = localStorage.getItem('accessToken')?.trim();
    let refreshToken = localStorage.getItem('refreshToken')?.trim();

    if (!accessToken || !refreshToken) {
      console.error('Reissue 요청 실패 : 토큰이 존재하지 않습니다.');
      alert('로그아웃 되었습니다. 다시 로그인 하세요');
      logoutAndRedirect();
      return;
    }

    try {
      console.log('Reissue 요청 - AccessToken : ', accessToken);
      console.log('Ressiue 요청 - RefreshToken : ', refreshToken);

      //토큰 재발급 요청하고 결과 받기
      const response = await apiClient.post('/reissue', null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
          ExtendLogin: extendLogin ? 'true' : 'false',
        },
      });

      console.log('Reissue 성공 - 응답 해더 : ', response.headers);
      // 새로 발급된 토큰으로 업데이트
      updateTokens(
        response.headers['Authorization']?.split(' ')[1]?.trim(), // Bearer token 분리
        response.headers['Refresh-Token']?.split(' ')[1]?.trim()
      );
    } catch (error) {
      console.error('Reissue 실패 - 상태코드 : ', error.response?.status);
      console.error('Reissue 실패 - 응답 데이터 : ', error.response?.data);

      const expiredTokenType = error.response?.headers['token-expired'];
      if (expiredTokenType === 'RefreshToken' || error.response?.data === 'Session Expired') {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        logoutAndRedirect();
      } else if (expiredTokenType === 'AccessToken') {
        console.warn('AccessToken 만료됨. RefreshToken으로 재발급 시도 중...');
        return await handleReissueTokens();
      } else {
        console.error('Reissue 중 예상치 못한 오류 발생:', error.message);
        logoutAndRedirect();
      }
    }
  }; // handleReissueTokens

  // 다른 컴포넌트에 제공할 함수나 데이터는 반드시 AuthContext.Provider 의 value 에 추가해 놓아야 함
  // authInfo 작성하면 다른 컴포넌트에서 사용시 authInfo 로만 사용할 수 있음, authInfo.isLoggedIn
  // ...authInfo 작성하면 다름 컴포넌트에서 사용시, isLoggedIn 으로 바로 사용 가능함
  return (
    <AuthContext.Provider
      value={{
        ...authInfo,
        setAuthInfo,
        isAuthLoading,
        secureApiRequest,
        logoutAndRedirect,
        updateTokens,
      }}
    >
      {children}
      {/* 💡 5. 알림 상태가 존재할 때만 NotificationToast 컴포넌트를 렌더링합니다. */}
      <NotificationToast notification={notification} onClose={handleCloseNotification} />
    </AuthContext.Provider>
  );
}; // AuthProvider

// 함수 앞에 export 사용하면, export default 함수명; 사용 안 함
