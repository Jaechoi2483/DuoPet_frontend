const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API 프록시
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