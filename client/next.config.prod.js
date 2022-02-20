const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  serverRuntimeConfig: {
    rsHost: process.env.RS_HOST || 'http://localhost:3000',
  },
  assetPrefix: isProd ? 'https://cdn.rs.school' : '',
  env: {
    BUILD_VERSION: process.env.BUILD_VERSION || '0.0.0.0.0',
    APP_VERSION: process.env.APP_VERSION,
    RSSHCOOL_UI_GCP_MAPS_API_KEY: process.env.RSSHCOOL_UI_GCP_MAPS_API_KEY,
  },
};
module.exports = nextConfig;
