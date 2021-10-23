const path = require('path');
const webpack = require('webpack');
const isProd = process.env.NODE_ENV === 'production';

const server = process.env.SERVER_URL || 'http://localhost:3001';
const nestjs = process.env.NESTJS_URL || 'http://localhost:3002';

const nextConfig = {
  rewrites: () => [
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
  assetPrefix: isProd ? 'https://cdn.rs.school' : '',
  webpack: config => {
    config.resolve.alias['configs'] = path.join(__dirname, 'src/configs');
    config.resolve.alias['components'] = path.join(__dirname, 'src/components');
    config.resolve.alias['services'] = path.join(__dirname, 'src/services');
    config.resolve.alias['utils'] = path.join(__dirname, 'src/utils');
    config.resolve.alias['domain'] = path.join(__dirname, 'src/domain');
    config.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/));
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
module.exports = nextConfig;
