// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // any request starting with /api
    createProxyMiddleware({
      target: 'http://127.0.0.1:5000', // your Flask backend
      changeOrigin: true,
    })
  );
};
