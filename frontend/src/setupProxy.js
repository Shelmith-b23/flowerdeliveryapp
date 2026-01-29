// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // any request starting with /api
    createProxyMiddleware({
      target: 'http://localhost:5000', // Local backend development
      changeOrigin: true,
    })
  );
};
