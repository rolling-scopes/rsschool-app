const path = require('path');
const webpack = require('webpack');

const nextConfig = {
  serverRuntimeConfig: {
    rsHost: process.env.RS_HOST || 'http://localhost:3000',
  },
  env: {
    BUILD_VERSION: process.env.BUILD_VERSION || '0.0.0.0.0',
    APP_VERSION: process.env.APP_VERSION,
  },
  webpack: config => {
    config.resolve.alias['configs'] = path.join(__dirname, 'configs');
    config.resolve.alias['components'] = path.join(__dirname, 'components');
    config.resolve.alias['services'] = path.join(__dirname, 'services');
    config.resolve.alias['utils'] = path.join(__dirname, 'utils');
    config.resolve.alias['rules'] = path.join(__dirname, 'rules');
    config.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/));
    return config;
  },
};

module.exports = nextConfig;
