const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // AI 서비스 프록시를 먼저 정의 (더 구체적인 경로를 먼저)
  // FastAPI health-diagnose 서비스
  app.use(
    '/api/v1',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('AI API 프록시 - Original URL:', req.url);
        console.log('AI API 프록시 - Original Path:', req.path);
        console.log('AI API 프록시 - Target Path:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('AI API 프록시 에러:', err);
      }
    })
  );


  // Spring Boot API 프록시 (나중에 정의 - 덜 구체적인 경로)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );

  // WebSocket 프록시
  app.use(
    '/ws-consultation',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      ws: true,
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReqWs: (proxyReq, req, socket) => {
        console.log('WebSocket 프록시 요청:', req.url);
      },
      onError: (err, req, res) => {
        console.error('WebSocket 프록시 에러:', err);
      }
    })
  );
};