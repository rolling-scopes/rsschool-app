const path = require('path');
const webpack = require('webpack');
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
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
    config.resolve.alias['configs'] = path.join(__dirname, 'configs');
    config.resolve.alias['components'] = path.join(__dirname, 'components');
    config.resolve.alias['services'] = path.join(__dirname, 'services');
    config.resolve.alias['utils'] = path.join(__dirname, 'utils');
    config.resolve.alias['domain'] = path.join(__dirname, 'domain');
    config.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/));
    return config;
  },
};
module.exports = nextConfig;
