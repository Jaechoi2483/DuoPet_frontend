// CORS 테스트 스크립트
// 백엔드가 여러 포트를 지원하는지 확인

const testCORS = async () => {
  const ports = [3000, 3001];
  const endpoint = 'http://localhost:8080/api/consultation/vet-profiles/available';
  
  for (const port of ports) {
    console.log(`\n=== Testing from port ${port} ===`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Origin': `http://localhost:${port}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`CORS Headers:`);
      console.log(`- Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
      console.log(`- Access-Control-Allow-Credentials: ${response.headers.get('Access-Control-Allow-Credentials')}`);
      
      if (response.ok) {
        console.log(`✅ Port ${port} can access the backend`);
      } else {
        console.log(`❌ Port ${port} received error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Port ${port} failed with error:`, error.message);
    }
  }
};

// Node.js에서 실행하려면:
// node test-cors.js
if (typeof window === 'undefined') {
  // Node.js 환경
  const fetch = require('node-fetch');
  testCORS();
} else {
  // 브라우저 환경
  testCORS();
}