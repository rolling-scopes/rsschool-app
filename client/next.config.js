const webpack = require('webpack');
const prodConfig = require('./next.config.prod');

const isProd = process.env.NODE_ENV === 'production';

const server = process.env.SERVER_HOST || 'http://localhost:3001';
const nestjs = process.env.NESTJS_HOST || 'http://localhost:3002';

const nextConfig = {
  ...prodConfig,
  rewrites: () =>
    isProd
      ? []
      : [
          { source: '/certificate/:path*', destination: `${server}/certificate/:path*` },
          { source: '/swagger', destination: `${nestjs}/swagger/` },
          { source: '/swagger-json', destination: `${nestjs}/swagger-json` },
          { source: '/swagger:path', destination: `${nestjs}/swagger/swagger:path` },
          { source: '/api/v2/:path*', destination: `${nestjs}/:path*` },
          { source: '/api/:path*', destination: `${server}/:path*` },
        ],
  webpack: config => {
    config.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/));
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
module.exports = nextConfig;
