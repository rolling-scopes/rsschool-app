const path = require('path');
const webpack = require('webpack');
const withTranspiledModules = require('next-transpile-modules');

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
    config.resolve.alias['domain'] = path.join(__dirname, 'domain');
    config.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/));
    return withGaugeChartCss(config);
  },
};
module.exports = withTranspiledModules(['react-gauge-chart'])(nextConfig);

function withGaugeChartCss(config) {
  const rule = config.module.rules
    .find(rule => rule.oneOf)
    .oneOf.find(
      r =>
        // Find the global CSS loader
        r.issuer && r.issuer.include && r.issuer.include.includes('_app'),
    );
  if (rule) {
    rule.issuer.include = [rule.issuer.include, /[\\/]node_modules[\\/]react-gauge-chart[\\/]/];
  }
  return config;
}
