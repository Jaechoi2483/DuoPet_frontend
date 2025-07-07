import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// 라우터 사용을 위한 추가
// import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <React.StrictMode>는 React 의 개발 모드에서만 동작하는 컴포턴트임
        프로덕션 빌드에서는 실행되지 않으며, 개발 중에만 코드의 잠재적인 문제를 감지해 경고를 표시함
        개발 중에 React.StrictMode로 감싼 컴포넌트는 두 번 랜더링됨
        이를 통해 의심스러운 사이드 이펙트를 감지함  (프로덕션 빌드에서는 두 번 랜더링하지 않음)
        예를 들어 : 
          useEffect 의 잘못된 정리 함수
          동기화되지 않은 상태 업데이트
          불필요한 랜더링
    */}
    <AuthProvider>
      {/* <BrowserRouter> 프로젝트 전체에서 한번만 사용함 : App.js 에서 사용하였음 */}
      <App />
      {/* </BrowserRouter> */}
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
