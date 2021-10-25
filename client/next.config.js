const webpack = require('webpack');
const isProd = process.env.NODE_ENV === 'production';

const server = process.env.SERVER_HOST || 'http://localhost:3001';
const nestjs = process.env.NESTJS_HOST || 'http://localhost:3002';

const nextConfig = {
  rewrites: () =>
    isProd
      ? []
      : [
          { source: '/certificate/:path*', destination: `${server}/certificate/:path*` },
          { source: '/api/alerts/:path*', destination: `${nestjs}/alerts/:path*` },
          { source: '/api/:path*', destination: `${server}/:path*` },
          {
            source: '/:any*',
            destination: '/',
          },
        ],
  serverRuntimeConfig: {
    rsHost: process.env.RS_HOST || 'http://localhost:3000',
  },
  env: {
    BUILD_VERSION: process.env.BUILD_VERSION || '0.0.0.0.0',
    APP_VERSION: process.env.APP_VERSION,
    RSSHCOOL_UI_GCP_MAPS_API_KEY: process.env.RSSHCOOL_UI_GCP_MAPS_API_KEY,
  },
  webpack: config => {
    config.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/));
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
module.exports = nextConfig;
