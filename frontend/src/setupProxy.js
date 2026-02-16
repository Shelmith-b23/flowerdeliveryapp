// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // any request starting with /api
    createProxyMiddleware({
      target: 'https://flowerdeliveryapp-aid0.onrender.com', // backend URL
      changeOrigin: true,
    })
  );
};
