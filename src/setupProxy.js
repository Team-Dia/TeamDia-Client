const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://43.201.136.44:8070",
      changeOrigin: true,
    })
  );
};
